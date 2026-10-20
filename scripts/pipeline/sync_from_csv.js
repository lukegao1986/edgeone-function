const fs = require('fs');
const path = require('path');

async function main() {
    const mappingRaw = JSON.parse(fs.readFileSync('csv_mapping.json', 'utf8'));
    const mapping = {};
    
    mappingRaw.forEach(r => {
        if (r.businessCode) {
            mapping[r.businessCode] = {
                topicCode: r.topicCode,
                subtopicCodes: r.subtopicCodes ? r.subtopicCodes.split(';') : []
            };
        }
    });

    const chapters = [21, 22, 23, 24, 25, 26, 27, 28, 29];
    let updatedCount = 0;
    let updatedItems = 0;

    for (const ch of chapters) {
        const prefix = (ch >= 28) ? 'phy_5' : 'phy_4';
        const jsonPath = path.join(process.cwd(), `docs/0 数据准备/Charpter 1-30/charpter${ch}/${prefix}_chapter${ch}_questions.json`);
        if (!fs.existsSync(jsonPath)) continue;

        let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        let modified = false;

        for (let q of data) {
            const mapData = mapping[q.businessCode];
            if (mapData) {
                let itemModified = false;
                
                if (q.topicCode !== mapData.topicCode) {
                    q.topicCode = mapData.topicCode;
                    itemModified = true;
                }
                
                const currentSubs = q.subtopicCodes || [];
                const targetSubs = mapData.subtopicCodes;
                
                if (JSON.stringify(currentSubs) !== JSON.stringify(targetSubs)) {
                    q.subtopicCodes = targetSubs;
                    itemModified = true;
                }
                
                if (itemModified) {
                    modified = true;
                    updatedItems++;
                }
            }
        }

        if (modified) {
            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Updated JSON file: ${jsonPath}`);
            updatedCount++;
        }
    }
    
    console.log(`Finished. Updated ${updatedItems} items across ${updatedCount} JSON files.`);
}

main().catch(console.error);