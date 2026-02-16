const { parentPort } = require('worker_threads');

const allItems = new Map();
const selectedItems = new Set();

function initializeData() {
    console.time('worker:initializeData');
    for (let i = 1; i <= 1000000; i++) {
        allItems.set(i, {
            id: i,
            name: `Element ${i}`,
            createdAt: Date.now(),
        });
    }
    console.timeEnd('worker:initializeData');
    console.log(`Worker initialized with ${allItems.size} items`);
}

function searchItems({ offset, limit, search, selectedIds }) {
    const result = [];
    let count = 0;
    let skipped = 0;

    selectedItems.clear();
    selectedIds.forEach(id => selectedItems.add(id));

    for (const [id, item] of allItems) {
        if (selectedItems.has(id)) {
            continue;
        }

        if (search && !id.toString().includes(search)) {
            continue;
        }

        if (skipped < offset) {
            skipped++;
            continue;
        }

        if (count < limit) {
            result.push(item);
            count++;
        } else {
            break;
        }
    }
    return result;
}

initializeData();

parentPort.on('message', (task) => {
    if (task.type === 'search') {
        const result = searchItems(task.payload);
        parentPort.postMessage({
            type: 'search_result',
            payload: result,
            requestId: task.requestId
        });
    } else if (task.type === 'add') {
        const newItem = task.payload;
        allItems.set(newItem.id, newItem);
    }
});