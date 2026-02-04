class QueueManager {
  constructor(storage) {
    this.storage = storage;
    this.queues = {
      add: new Map(),
      get: new Map(),
      update: new Map()
    };

    this.batchIntervals = {
      add: 10000,
      get: 1000,
      update: 1000
    };

    this.setupBatching();
  }

  addToQueue(queueName, key, data) {
    if (this.queues[queueName].has(key)) {
      return this.queues[queueName].get(key).promise;
    }

    let res, rej;
    const promise = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    });

    this.queues[queueName].set(key, { promise, resolve: res, reject: rej, data });
    return promise;
  }

  setupBatching() {
    Object.keys(this.batchIntervals).forEach(type => {
      setInterval(() => this.processBatch(type), this.batchIntervals[type]);
    });
  }

  async processBatch(type) {
    const queue = this.queues[type];
    if (queue.size === 0) return;

    const items = Array.from(queue.entries());
    queue.clear();

    console.log(`[Batch] Processing ${type}: ${items.length} items`);

    if (type === 'add') {
      items.forEach(([id, { resolve, reject }]) => {
        try {
          const newItem = this.storage.addItem(id);
          resolve(newItem);
        } catch (err) {
          reject(err);
        }
      });
    } 
    
    else if (type === 'update') {
      items.forEach(([id, { resolve, reject, data }]) => {
        try {
          if (data.action === 'select') this.storage.addToSelected(id);
          if (data.action === 'deselect') this.storage.removeFromSelected(id);
          if (data.action === 'reorder') this.storage.updateSelectedOrder(data.order);
          resolve({ success: true });
        } catch (err) {
          reject(err);
        }
      });
    }

    else if (type === 'get') {
      items.forEach(([key, { resolve, reject, data }]) => {
        try {
          const result = data.fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    }
  }
}

module.exports = QueueManager;