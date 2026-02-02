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

    getAvailableItems(offset = 0, limit = 20, search = '') {
        const result = [];
        let count = 0;
        let skipped = 0;

        for (const [id, item] of this.data.allItems) {
            // Пропускаем выбранные
            if (this.data.selected.items.has(id)) {
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