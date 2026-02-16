const { Worker } = require('worker_threads');
const path = require('path');
const crypto = require('crypto');

class ItemStorage {
    constructor() {
        this.data = {
            allItems: new Map(), 
            selected: {
                items: new Map(),
                order: []
            },
            nextId: 1000001
        };

        this.initializeData();

        this.worker = new Worker(path.resolve(__dirname, 'search.worker.js'));
        this.pendingSearches = new Map();

        this.worker.on('message', (message) => {
            if (message.type === 'search_result' && this.pendingSearches.has(message.requestId)) {
                const { resolve } = this.pendingSearches.get(message.requestId);
                resolve(message.payload);
                this.pendingSearches.delete(message.requestId);
            }
        });

        this.worker.on('error', (err) => {
            console.error('Worker error:', err);
        });
    }

    initializeData() {
        console.time('initializeData');

        for (let i = 1; i <= 1000000; i++) {
            this.data.allItems.set(i, {
                id: i,
                name: `Element ${i}`,
                createdAt: Date.now(),
            });
        }
        console.timeEnd('initializeData');
        console.log(`Initialized ${this.data.allItems.size} items`);
    }

    async getAvailableItems(offset = 0, limit = 20, search = '') {
 
        return new Promise((resolve, reject) => {
            const requestId = crypto.randomBytes(16).toString('hex');
            this.pendingSearches.set(requestId, { resolve, reject });

            this.worker.postMessage({
                type: 'search',
                requestId,
                payload: {
                    offset,
                    limit,
                    search,
                    selectedIds: Array.from(this.data.selected.items.keys())
                }
            });

            setTimeout(() => {
                if (this.pendingSearches.has(requestId)) {
                    reject(new Error('Search timed out'));
                    this.pendingSearches.delete(requestId);
                }
            }, 10000);
        });
    }

    getSelectedItems(offset = 0, limit = 20, search = '') {
        const result = [];
        let count = 0;

        // Используем сохраненный порядок для Drag&Drop
        for (let i = offset; i < this.data.selected.order.length; i++) {
            if (count >= limit) break;

            const id = this.data.selected.order[i];
            const item = this.data.selected.items.get(id);

            if (!item) continue;

            // Фильтрация по поиску
            if (search && !id.toString().includes(search)) {
                continue;
            }

            result.push(item);
            count++;
        }

        return result;
    }

    addItem(customId = null) {
        const id = customId || this.data.nextId++;

        if (this.data.allItems.has(id)) {
            throw new Error(`Элемент с ID ${id} уже существует`);
        }

        const newItem = {
            id,
            name: `Custom Element ${id}`,
            createdAt: Date.now(),
        };

        this.data.allItems.set(id, newItem);

        this.worker.postMessage({
            type: 'add',
            payload: newItem
        });

        return newItem;
    }

    addToSelected(itemId) {
        const item = this.data.allItems.get(itemId);
        if (!item) {
            throw new Error(`Item with ID ${itemId} not found`);
        }

        if (!this.data.selected.items.has(itemId)) {
            this.data.selected.items.set(itemId, { ...item });
            this.data.selected.order.push(itemId);
        }
    }

    removeFromSelected(itemId) {
        this.data.selected.items.delete(itemId);
        this.data.selected.order = this.data.selected.order.filter(id => id !== itemId);
    }

    // Обновление порядка Drag&Drop
    updateSelectedOrder(newOrder) {
        const validOrder = newOrder.filter(id => this.data.selected.items.has(id));
        this.data.selected.order = validOrder;
    }

    getStats() {
        return {
            totalItems: this.data.allItems.size,
            selectedCount: this.data.selected.items.size,
            nextId: this.data.nextId
        };
    }
}

module.exports = ItemStorage;