// Algorithms.js - خوارزميات البحث لمحرك WEX

// دالة لتحليل سطر من dataset.json
function parseLine(line) {
    try {
        line = line.trim();
        if (!line.startsWith('{') || !line.endsWith('}')) {
            return null;
        }

        // إزالة الأقواس الخارجية
        let content = line.substring(1, line.length - 1).trim();

        // تقسيم إلى أجزاء بطريقة أكثر أمانًا
        const urlMatch = content.match(/url\s*=\s*([^,]+)/);
        const nameMatch = content.match(/name\s*=\s*\{([^}]*)\}/);
        const descMatch = content.match(/description\s*=\s*\{([^}]*)\}/);

        if (!urlMatch || !nameMatch || !descMatch) {
            return null;
        }

        const url = urlMatch[1].trim();
        const names = nameMatch[1]
            .split(',')
            .map(n => n.trim())
            .filter(n => n);
        const descriptions = descMatch[1]
            .split(',')
            .map(d => d.trim())
            .filter(d => d);

        return {
            url: url || '',
            name: names.length ? names : ['بدون اسم'],
            description: descriptions.length ? descriptions : ['بدون وصف']
        };
    } catch (e) {
        console.error("Error parsing line:", line, e);
        return null;
    }
}

// دالة لتحويل كل dataset إلى مصفوفة
function parseDataset(datasetText) {
    if (!datasetText || typeof datasetText !== 'string') return [];

    const lines = datasetText.split('\n');
    const result = [];

    for (const line of lines) {
        if (line.trim() === '') continue;

        const parsed = parseLine(line);
        if (parsed) {
            result.push(parsed);
        }
    }

    return result;
}

// دالة البحث الرئيسية
function search(query, datasetText) {
    try {
        if (!query || typeof query !== 'string') return [];

        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) return [];

        const dataset = Array.isArray(datasetText)
            ? datasetText
            : parseDataset(datasetText);

        if (!dataset.length) return [];

        const results = [];

        for (const item of dataset) {
            let score = 0;

            // البحث في الأسماء
            if (item.name && Array.isArray(item.name)) {
                for (const name of item.name) {
                    if (typeof name === 'string' && name.toLowerCase().includes(searchTerm)) {
                        score += 10;
                        break;
                    }
                }
            }

            // البحث في الوصف إذا لم يُحسب أي نتيجة من الاسم
            if (score === 0 && item.description && Array.isArray(item.description)) {
                for (const desc of item.description) {
                    if (typeof desc === 'string' && desc.toLowerCase().includes(searchTerm)) {
                        score += 5;
                        break;
                    }
                }
            }

            // البحث في الرابط إذا لم يُحسب أي نتيجة من الاسم أو الوصف
            if (score === 0 && item.url && typeof item.url === 'string' && item.url.toLowerCase().includes(searchTerm)) {
                score += 3;
            }

            if (score > 0) {
                results.push({ item, score });
            }
        }

        // ترتيب النتائج حسب العلامة
        results.sort((a, b) => b.score - a.score);

        // إرجاع العناصر فقط
        return results.map(r => r.item);
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}

// جعل الدوال متاحة للاستخدام
window.WEXAlgorithms = {
    search,
    parseDataset
};
