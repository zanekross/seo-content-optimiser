const keywordStats = {};

function optimizeContent() {
    document.getElementById('outputContent').style.display = 'block';
    document.getElementById('keywordStatistics').style.display = 'block';
    document.getElementById('finishButton').style.display = 'block';
    document.getElementById('copyToClipboardButton').style.display = 'block';

    const htmlContent = document.getElementById("htmlContent").value;
    const keywordsTextarea = document.getElementById("keywords");
    const primaryKeywords = keywordsTextarea.value.split("\n").map(keyword => keyword.trim());
    const additionalKeywordsTextarea = document.getElementById("additionalKeywords");
    const additionalKeywordsAndUrls = additionalKeywordsTextarea.value.trim().split('\n');
    
    console.log(primaryKeywords);
    console.log(typeof primaryKeywords);

    const additionalKeywordsMap = {};

    let currentUrl = '';
    let insideH1Tag = false; // Initialize the flag here
    for (const line of additionalKeywordsAndUrls) {
        if (line.trim() === '') {
            currentUrl = '';
        } else if (!currentUrl) {
            currentUrl = line.trim();
        } else {
            if (!additionalKeywordsMap[currentUrl]) {
                additionalKeywordsMap[currentUrl] = [];
            }
            additionalKeywordsMap[currentUrl].push(line.trim());
        }
    }

    let cleanedContent = htmlContent.replace(/&nbsp;/g, '');

    cleanedContent = cleanedContent.replace(/<p><br \/><br \/><\/p>/, '');

    // Basically looking for any occurences of </realstrong> the tag we made earlier to represent 
    // actual </strong></p> occurences as opposed to when it is just appearing in headings

    // cleanedContent = cleanedContent.replace(/\.<\/strong>/g, '.</realstrong>');

    //Using the logic that strong tags at the end of actual paragaphs will be preceeded
    //or followed by punctuation marks of some sort. Remove them before </strong></p> is 
    //replaced with </h2>

    cleanedContent = cleanedContent.replace(/\.<\/strong>/g, '.');
    cleanedContent = cleanedContent.replace(/<\/strong>\./g, '.');

    // cleanedContent = cleanedContent.replace(/\?<\/strong>/g, '?');
    // cleanedContent = cleanedContent.replace(/<\/strong>\?/g, '?');
    
    // cleanedContent = cleanedContent.replace(/!<\/strong>/g, '!');
    // cleanedContent = cleanedContent.replace(/<\/strong>!/g, '!');


    cleanedContent = cleanedContent.replace(/<p><strong>H[1-2]: /g, '<h2>');

    cleanedContent = cleanedContent.replace(/<\/strong><\/p>/g, '<\/h2>');

    cleanedContent = cleanedContent.replace(/<\/?(strong|em)>/g, ''); // Remove existing <strong> and <em> tags

    cleanedContent = cleanedContent.replace(/<\/(p|h[1-6]|li|ul|ol)>/g, '</$1>\n');

    cleanedContent = cleanedContent.replace(/<(ol|ul)>/g, '<$1>\n');

    cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');

    cleanedContent = cleanedContent.replace(/<li>/g, '  <li>');

    cleanedContent = cleanedContent.replace(/&nbsp;/g, '');

    cleanedContent = cleanedContent.replace(/&lsquo;/g, "'");

    cleanedContent = cleanedContent.replace(/&rsquo;/g, "'");

    cleanedContent = cleanedContent.replace(/&rdquo;/g, '"');

    cleanedContent = cleanedContent.replace(/&ldquo;/g, '"');

    cleanedContent = cleanedContent.replace(/&ndash;/g, '-');

    cleanedContent = cleanedContent.trim();

    let optimizedContent = cleanedContent;

    // Use regular expressions to find and replace keywords inside open <h1> tags with <em> tags
    primaryKeywords.forEach(keyword => {
        const keywordPattern = new RegExp(`(<h2[^>]*>.*?)(\\b${keyword}\\b)(.*?</h2>)`, "gi");

        optimizedContent = optimizedContent.replace(keywordPattern, (match, beforeH1, keywordMatch, afterH1) => {
            if (!keywordStats[keyword]) {
                keywordStats[keyword] = { strongTagCount: 0, aTagCount: 0, emTagCount: 0 };
            }
            keywordStats[keyword].emTagCount++;
            return `${beforeH1}<em>${keywordMatch}</em>${afterH1}`;
        });
    });

    // Replace other occurrences of primary keywords with <strong> tags
    primaryKeywords.forEach(keyword => {
        const keywordPattern = new RegExp(`\\b${keyword}\\b`, "gi");
        if (!insideH1Tag) {
            optimizedContent = optimizedContent.replace(keywordPattern, match => {
                if (!keywordStats[keyword]) {
                    keywordStats[keyword] = { strongTagCount: 0, aTagCount: 0, emTagCount: 0 };
                }
                keywordStats[keyword].strongTagCount++;
                return `<strong>${match}</strong>`;
            });
        }
    });

        // Wrap additional keywords in <a> tags with the relevant URLs and update keyword statistics
        Object.keys(additionalKeywordsMap).forEach(url => {
            const keywords = additionalKeywordsMap[url];
            keywords.forEach(keyword => {
                const keywordPattern = new RegExp(`\\b${keyword}\\b`, "gi");
                
                // Check if the keyword is not part of any primary keyword
                const isSecondaryKeyword = !primaryKeywords.some(primaryKeyword => {
                    const primaryKeywordWords = primaryKeyword.split(" ");
                    let lastMatchedIndex = -1;
                    
                    // Iterate through words in the secondary keyword
                    for (const word of keyword.split(" ")) {
                        const matchIndex = primaryKeywordWords.indexOf(word);
                        if (matchIndex > lastMatchedIndex) {
                            lastMatchedIndex = matchIndex;
                        } else {
                            // If the words in the secondary keyword are not in the same order as the primary keyword, it's not part of it
                            return false;
                        }
                    }
                    
                    return true; // All words in the secondary keyword are in the same order as the primary keyword
                });

                if (isSecondaryKeyword) {
                    optimizedContent = optimizedContent.replace(keywordPattern, match => {
                        // Update keyword statistics for <a> tags
                        if (!keywordStats[keyword]) {
                            keywordStats[keyword] = { strongTagCount: 0, aTagCount: 1 };
                        } else {
                            keywordStats[keyword].aTagCount++;
                        }
                        return `<a href="${url}">${match}</a>`;
                    });
                }
            });
        });

    // Reset the flag after processing primary keywords
    insideH1Tag = false;
    
    optimizedContent = optimizedContent.replace(/<em><strong>(.*?)<\/strong><\/em>/g, '<em>$1</em>');
    document.getElementById("outputContent").textContent = optimizedContent;
}



function finishOptimization() {
    // Clear the previous keyword statistics
    document.getElementById("keywordList").innerHTML = "";

    // Extract keywords from the primary and additional lists
    const keywordsTextarea = document.getElementById("keywords");
    const primaryKeywords = keywordsTextarea.value.split("\n").map(keyword => keyword.trim());

    const additionalKeywordsTextarea = document.getElementById("additionalKeywords");
    const additionalKeywordsAndUrls = additionalKeywordsTextarea.value.trim().split('\n');
    
    const additionalKeywordsMap = {};

    let currentUrl = '';
    for (const line of additionalKeywordsAndUrls) {
        if (line.trim() === '') {
            // Empty line indicates the end of keywords for the current URL
            currentUrl = '';
        } else if (!currentUrl) {
            // The first non-empty line is treated as the URL
            currentUrl = line.trim();
        } else {
            // Lines after the URL are treated as keywords
            if (!additionalKeywordsMap[currentUrl]) {
                additionalKeywordsMap[currentUrl] = [];
            }
            additionalKeywordsMap[currentUrl].push(line.trim());
        }
    }

    // Calculate keyword statistics for both primary and additional keywords
    const keywordStatistics = {};

    primaryKeywords.forEach(keyword => {
        const strongTagCount = (keywordStats[keyword] && keywordStats[keyword].strongTagCount) || 0;
        const aTagCount = (keywordStats[keyword] && keywordStats[keyword].aTagCount) || 0;
        const emTagCount = (keywordStats[keyword] && keywordStats[keyword].emTagCount) || 0;
        keywordStatistics[keyword] = {
            strongTagCount,
            aTagCount,
            emTagCount
        };
    });

    Object.keys(additionalKeywordsMap).forEach(url => {
        const keywords = additionalKeywordsMap[url];
        keywords.forEach(keyword => {
            const strongTagCount = (keywordStats[keyword] && keywordStats[keyword].strongTagCount) || 0;
            const aTagCount = (keywordStats[keyword] && keywordStats[keyword].aTagCount) || 0;
            const emTagCount = (keywordStats[keyword] && keywordStats[keyword].emTagCount) || 0;
            keywordStatistics[keyword] = {
                strongTagCount,
                aTagCount,
                emTagCount
            };
        });
    });

    // Display keyword statistics
    const keywordList = document.getElementById("keywordList");
    Object.keys(keywordStatistics).forEach(keyword => {
        const stats = keywordStatistics[keyword];
        const listItem = document.createElement("li");
        listItem.textContent = `${keyword}: Heading Tags (${stats.emTagCount}), Strong Tags (${stats.strongTagCount}), <a> Tags (${stats.aTagCount})`;
        keywordList.appendChild(listItem);
    });
}

function copyToClipboard() {
    const outputContent = document.getElementById("outputContent");
    const textToCopy = outputContent.textContent;

    // Create a temporary input element to hold the text
    const tempInput = document.createElement("textarea");
    tempInput.value = textToCopy;

    // Append the input element to the document
    document.body.appendChild(tempInput);

    // Select and copy the text
    tempInput.select();
    document.execCommand("copy");

    // Remove the temporary input element
    document.body.removeChild(tempInput);

}


