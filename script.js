const keywordStats = {};

// Function to convert a text line into a heading using <h1>, <h2> or <h3> tags
function convertToHeading(line) {
  const h1HeadingRegex = /^(h1:)/i;
  const h2HeadingRegex = /^(h2:)/i;
  const h3HeadingRegex = /^(h3:)/i;
  
  if ( h1HeadingRegex.test(line) ) {
    return `<h1>${line.slice(3).trim()}</h1>`;
  }
  if ( h2HeadingRegex.test(line) ) {
    return `<h2>${line.slice(3).trim()}</h2>`;
  }
  if ( h3HeadingRegex.test(line) ) {
    return `<h3>${line.slice(3).trim()}</h3>`;
  }
}

// Function to get the index for the last list item
function getListEndIndex(index, data) {
  const orderedListRegex = /^(\d+[\.\)]\s*)/;
  const unorderedListRegex = /^([-*]\s*)/;
  
  let j = index;
  let lastIndex = j;
  while (j < data.length) {
    if (orderedListRegex.test(data[j]) == false && unorderedListRegex.test(data[j]) == false) {
      lastIndex = j - 1;
      break;
    }
    j++;
  }
  if (j == data.length) {
    lastIndex = j - 1;
  }
  return lastIndex;
}

// Function to convert input text into HTML
function convertToHTML(inputText) {
  // If input text is empty, display error message
  if (inputText == "") {
    console.log("No input data provided!");
    return;
  }
  
  // Convert input text into a list of text blocks based on new lines
  let blocks = inputText.trim().split("\n");
  
  // Define our regular expression to identify each text blocks
  const headingRegex = /^(?:h1:|h2:|h3:)/i;         // Headings
  const orderedListRegex = /^(\d+[\.\)]\s*)/;       // Ordered List
  const unorderedListRegex = /^([-*]\s*)/;          // Unordered List
  
  // Loop through each text block to convert them using appropriate HTML tags
  let i=0
  while (i < blocks.length) {
    // If the current text block is empty meaning, an empty line, move to the next one
    if (blocks[i].trim() == "") {
      i++;
      continue;
    }
    // If the current text block is not empty, convert it using the appropriate HTML tag
    if ( headingRegex.test(blocks[i]) ) {
      // If its heading, convert it using the corresponding heading tags <h1>, <h2> or <h3>
      blocks[i] = convertToHeading(blocks[i]);
      
    } else if ( orderedListRegex.test(blocks[i]) || unorderedListRegex.test(blocks[i]) ) {
      // If its list items, convert it using corresponsing list tags <ol> or <ul> with <li> tags
      let listType = orderedListRegex.test(blocks[i]) ? "ol" : "ul";
      
      // Mark the start and end index for the list items
      let listStartIndex = i;
      let listEndIndex = getListEndIndex(i, blocks);

      // Wrap the starting text block with corresponding opening list tag 
      if (listType == "ol") {
        blocks[listStartIndex] = `<ol>\n<li>${blocks[listStartIndex].replace(orderedListRegex, "")}</li>`;
      } else {
        blocks[listStartIndex] = `<ul>\n<li>${blocks[listStartIndex].replace(unorderedListRegex, "")}</li>`;
      }

      // For all subsequent text blocks that are a list item, wrap them with <li> tags
      let j = listStartIndex + 1;
      while (j <= listEndIndex) {
        blocks[j] = listType == "ol" ? blocks[j].replace(orderedListRegex, "") : blocks[j].replace(unorderedListRegex, "");
        blocks[j] = "<li>" + blocks[j] + "</li>";
        j++;
      }

      // Wrap the last text block with corresponding closing list tag
      blocks[listEndIndex] += `\n</${listType}>`;
      
      // Update the loop counter to the last index so that it can resume looping through the remaining text blocks
      i = listEndIndex;
    } else {
      // For everything else, convert it using <p> tags
      blocks[i] = `<p>${blocks[i]}</p>`
    }
    
    i++;
  }
  
  // Append the list of all converted text blocks to the result
  let result = "";
  for (i=0; i < blocks.length; i++) {
    result += blocks[i] + "\n";
  }
  
  // Return the result
  return result;
}

function optimizeContent() {
    document.getElementById('outputContent').style.display = 'block';
    document.getElementById('keywordStatistics').style.display = 'block';
    document.getElementById('finishButton').style.display = 'block';
    document.getElementById('copyToClipboardButton').style.display = 'block';

    // Utilised the convertToHTML function for converting the initial content to HTML
    const htmlContent = convertToHTML(document.getElementById("htmlContent").value);
    
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


