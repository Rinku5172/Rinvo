// Recent Files History Manager
class HistoryManager {
    constructor() {
        this.storageKey = 'rocketpdf_history';
        this.maxItems = 20;
    }

    addFile(fileName, toolName, fileSize) {
        const history = this.getHistory();
        const newItem = {
            id: Date.now(),
            fileName: fileName,
            toolName: toolName,
            fileSize: fileSize,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };

        history.unshift(newItem);

        // Keep only max items
        if (history.length > this.maxItems) {
            history.splice(this.maxItems);
        }

        localStorage.setItem(this.storageKey, JSON.stringify(history));
        return newItem;
    }

    getHistory() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    clearHistory() {
        localStorage.removeItem(this.storageKey);
    }

    removeItem(id) {
        let history = this.getHistory();
        history = history.filter(item => item.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(history));
    }

    getStats() {
        const history = this.getHistory();
        const toolCounts = {};
        let totalSize = 0;

        history.forEach(item => {
            toolCounts[item.toolName] = (toolCounts[item.toolName] || 0) + 1;
            totalSize += item.fileSize || 0;
        });

        return {
            totalFiles: history.length,
            totalSize: totalSize,
            toolCounts: toolCounts,
            mostUsedTool: Object.keys(toolCounts).reduce((a, b) =>
                toolCounts[a] > toolCounts[b] ? a : b, Object.keys(toolCounts)[0])
        };
    }
}

// Initialize global history manager
const historyManager = new HistoryManager();
