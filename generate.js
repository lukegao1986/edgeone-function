const fs = require('fs');
const katex = require('katex');

const html1 = katex.renderToString('\\sqrt{3} = 1.73', {throwOnError: false});
const html2 = katex.renderToString('\\sqrt{\\frac{a+b}{c}} = 1', {throwOnError: false});

function replaceSvgWithImg(html) {
  return html.replace(/<svg([\s\S]*?)>([\s\S]*?)<\/svg>/g, (match, p1, p2) => {
    const svgString = '<svg' + p1 + '>' + p2 + '</svg>';
    const encoded = encodeURIComponent(svgString).replace(/'/g, '%27').replace(/"/g, '%22');
    const heightMatch = p1.match(/height=(['"])(.*?)\1/);
    const h = heightMatch ? heightMatch[2] : '100%';
    
    // Always use 100% width instead of the SVG's 400em width
    return '<img src="data:image/svg+xml;charset=utf-8,' + encoded + '" style="width:100%; height:' + h + '; display:block;" />';
  });
}

const finalHtml = `
<!DOCTYPE html>
<html><head><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"></head>
<body style="font-size: 3em;">
  <div>Original KaTeX:</div>
  <div>${html1}</div>
  <div>${html2}</div>
  <br>
  <div>Replaced with IMG (width:100%):</div>
  <div>${replaceSvgWithImg(html1)}</div>
  <div>${replaceSvgWithImg(html2)}</div>
</body>
</html>`;

fs.writeFileSync('test_katex.html', finalHtml);