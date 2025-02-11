// 在文件开头添加字体加载检查
document.fonts.load('32px "XiangcuiDazijitiW15-Regular"').then(() => {
    console.log('字体已加载');
});

// 在文件开头添加变量
let selectedColor = '#BE3535'; // 默认颜色

// 添加颜色选择事件监听
document.addEventListener('DOMContentLoaded', function() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除其他选中状态
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            // 添加当前选中状态
            this.classList.add('selected');
            // 更新选中的颜色
            selectedColor = this.dataset.color;
        });
    });
    
    // 默认选中第一个颜色
    colorOptions[0].classList.add('selected');
});

// 添加一个函数来判断颜色是否较浅
function isLightColor(hexColor) {
    // 将十六进制颜色转换为RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // 计算亮度 (基于人眼对不同颜色的敏感度)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128; // 亮度大于128认为是浅色
}

document.getElementById('generate-button').addEventListener('click', async function() {
    // 确保字体已加载
    await document.fonts.load('32px "XiangcuiDazijitiW15-Regular"');
    
    const text1 = document.getElementById('text1').value;
    const text2 = document.getElementById('text2').value;
    const text3 = document.getElementById('text3').value;
    const aspectRatio = document.getElementById('aspect-ratio').value;

    if (!text1 || !text2 || !text3) {
        alert('请填写所有文本');
        return;
    }

    // 选择图片比例
    let width, height;
    switch (aspectRatio) {
        case '9:16':
            width = 750;
            height = 1333;
            break;
        case '16:9':
            width = 1333;
            height = 750;
            break;
        case '2:3':
            width = 750;
            height = 1125;
            break;
        case '3:2':
            width = 1125;
            height = 750;
            break;
        case '3:4':
            width = 750;
            height = 1000;
            break;
        case '4:3':
            width = 1000;
            height = 750;
            break;
        default:
            width = 750;
            height = 1333;
    }

    // 设置画布
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    // 设置字体和样式
    ctx.fillStyle = 'white';
    ctx.font = '30px "XiangcuiDazijitiW15-Regular"';  // 更新字体名称
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 背景颜色和装饰
    ctx.fillStyle = selectedColor;  // 使用选中的背景颜色
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 金色不规则装饰
    ctx.fillStyle = 'gold';
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 10 + 2;
        const rotation = Math.random() * Math.PI;
        
        // 不规则的形状
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, -size);
        ctx.lineTo(-size, -size);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // 设置文本颜色
    const textColor = isLightColor(selectedColor) ? '#1c1414' : '#F4E1B0';
    ctx.fillStyle = textColor;

    // 计算适合的字号
    function calculateOptimalFontSize(text, maxWidth, maxHeight, baseSize) {
        const minSize = Math.max(baseSize * 0.8, 24); // 最小字号不小于24px或基础字号的70%
        const maxSize = baseSize * 1.3; // 最大字号为基础字号的1.5倍
        const step = 2;
        
        for (let size = maxSize; size >= minSize; size -= step) {
            ctx.font = `${size}px "XiangcuiDazijitiW15-Regular"`;
            const metrics = ctx.measureText(text);
            const lines = Math.ceil(metrics.width / maxWidth);
            const totalHeight = lines * (size * 1.5);
            
            if (totalHeight <= maxHeight && metrics.width <= maxWidth * lines) {
                return size;
            }
        }
        return minSize;
    }

    // 优化后的水平文本换行函数
    function drawWrappedText(text, x, y, maxWidth, baseFontSize) {
        // 计算最佳字号，使用画布高度的40%作为第一段文本的最大高度
        const availableHeight = canvas.height * 0.4;
        const fontSize = calculateOptimalFontSize(text, maxWidth, availableHeight, baseFontSize);
        
        ctx.font = `${fontSize}px "XiangcuiDazijitiW15-Regular"`;
        ctx.textAlign = 'left';
        const lineHeight = fontSize * 1.5;
        let maxLineY = y;

        const paragraphs = text.split('\n');
        
        paragraphs.forEach(paragraph => {
            const chars = paragraph.split('');
            let line = '';
            let lineY = maxLineY;

            for (let i = 0; i < chars.length; i++) {
                const testLine = line + chars[i];
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && line !== '') {
                    ctx.fillText(line, x, lineY);
                    line = chars[i];
                    lineY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, lineY);
            maxLineY = lineY + lineHeight;
        });

        return maxLineY;
    }

    // 优化竖排文本的字号计算
    function calculateOptimalVerticalFontSize(text, maxHeight, maxWidth, baseSize) {
        const minSize = Math.max(baseSize * 0.9, 24); // 最小字号不小于24px或基础字号的90%
        const maxSize = baseSize * 1.5; // 最大字号为基础字号的1.5倍
        const step = 2;
        
        for (let size = maxSize; size >= minSize; size -= step) {
            const lineHeight = size * 1.5;
            const charsPerColumn = Math.floor(maxHeight / lineHeight);
            const columnsNeeded = Math.ceil(text.length / charsPerColumn);
            const totalWidth = columnsNeeded * (size * 2);
            
            if (totalWidth <= maxWidth && text.length * lineHeight <= maxHeight * columnsNeeded) {
                return size;
            }
        }
        return minSize;
    }

    // 修改边距和间距
    const padding = 50; // 增大边距
    const textSpacing = 20;
    const maxFirstTextWidth = canvas.width - (padding * 1.2); // 增大边距

    // 绘制第一段文本
    const firstTextBottom = drawWrappedText(
        text1,
        padding,
        padding + 32,
        maxFirstTextWidth,
        34
    );

    // 修改竖排文本的可用空间
    const maxVerticalTextWidth = canvas.width * 0.4;
    const maxVerticalTextHeight = canvas.height - firstTextBottom - textSpacing;

    // 调整竖排文本的基础字号
    const text2OptimalSize = calculateOptimalVerticalFontSize(text2, maxVerticalTextHeight, maxVerticalTextWidth, 28);
    const text3OptimalSize = calculateOptimalVerticalFontSize(text3, maxVerticalTextHeight, maxVerticalTextWidth, 28);

    function drawVerticalWrappedText(text, startX, startY, maxHeight, fontSize, alignment = 'top', verticalAlign = 'top') {
        ctx.font = `${fontSize}px "XiangcuiDazijitiW15-Regular"`;
        ctx.textAlign = 'center';
        const lineHeight = fontSize * 1.4;
        const columnWidth = fontSize * 1.4; // 列宽
        const columnSpacing = fontSize * 0.1; // 列间距
        const lineSpacing = fontSize * 0.1; // 行间距
        
        // 预处理文本，处理破折号
        text = text.replace(/——/g, '︱︱');
        
        // 处理手动换行，保持换行结构
        const lines = text.split('\n').filter(line => line.length > 0);
        
        // 计算每列可以容纳的字符数
        const charsPerColumn = Math.floor((maxHeight * 0.95) / lineHeight);
        
        // 为每行文本计算布局
        const linesLayout = [];
        let maxWidth = 0;
        
        lines.forEach(line => {
            const chars = line.split('');
            // 计算当前行需要的列数
            const columns = Math.ceil(chars.length / charsPerColumn);
            // 计算当前行的实际宽度（包含列间距）
            const lineWidth = (columns - 1) * (columnWidth + columnSpacing) + columnWidth;
            maxWidth = Math.max(maxWidth, lineWidth);
            
            linesLayout.push({
                chars,
                columns,
                lineWidth
            });
        });
    
        // 计算水平起始位置
        let actualStartX = startX;
        if (alignment === 'right') {
            actualStartX = canvas.width - padding * 1.2;
        }
    
        // 计算实际文本高度
        const maxCharsInColumn = Math.min(
            charsPerColumn,
            Math.max(...lines.map(line => Math.min(line.length, charsPerColumn)))
        );
        const actualTextHeight = maxCharsInColumn * lineHeight;
        
        // 计算垂直位置
        let actualStartY = startY;
        if (verticalAlign === 'bottom') {
            actualStartY = canvas.height - padding * 1.2 - actualTextHeight;
        }
    
        // 记录上一行的信息
        let previousX = actualStartX;
        
        // 绘制每一行文本
        linesLayout.forEach((layout, lineIndex) => {
            const { chars, columns } = layout;
            
            // 计算当前行的起始X坐标
            let currentX;
            if (alignment === 'right') {
                currentX = lineIndex === 0 ? actualStartX : previousX - lineSpacing;
            } else {
                currentX = lineIndex === 0 ? actualStartX : previousX + lineSpacing;
            }
            
            // 绘制当前行的所有列
            for (let col = 0; col < columns; col++) {
                let currentY = actualStartY;
                const columnChars = chars.slice(
                    col * charsPerColumn, 
                    Math.min((col + 1) * charsPerColumn, chars.length)
                );
                
                // 绘制当前列的字符
                columnChars.forEach(char => {
                    ctx.fillText(char, currentX, currentY);
                    currentY += lineHeight;
                });
                
                // 移动到下一列，添加列间距
                if (alignment === 'right') {
                    currentX -= (columnWidth + columnSpacing);
                } else {
                    currentX += (columnWidth + columnSpacing);
                }
            }
            
            // 记录当前行的最终位置，用于下一行的起始位置计算
            previousX = currentX - (alignment === 'right' ? -columnSpacing : columnSpacing);
        });
    
        return {
            width: maxWidth,
            height: actualTextHeight
        };
    }
    
    // 绘制第二段文本（右侧）
    const text2Metrics = drawVerticalWrappedText(
        text2,
        canvas.width - padding,
        firstTextBottom + textSpacing,
        maxVerticalTextHeight,
        text2OptimalSize,
        'right',
        'bottom'
    );

    // 绘制第三段文本（左侧）
    const text3Metrics = drawVerticalWrappedText(
        text3,
        padding,
        firstTextBottom + textSpacing,
        maxVerticalTextHeight,
        text3OptimalSize,
        'left',
        'bottom'
    );

    // 显示下载按钮
    const downloadButton = document.getElementById('download-button');
    downloadButton.style.display = 'inline-block';
    
    // 添加下载按钮事件监听
    downloadButton.removeEventListener('click', downloadImage); // 移除旧的事件监听器
    downloadButton.addEventListener('click', downloadImage); // 添加新的事件监听器
});

// 下载图片函数
function downloadImage() {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a'); // 创建临时链接
    link.download = 'generated-image.png'; // 设置下载文件名
    link.href = canvas.toDataURL('image/png'); // 将画布内容转换为图片URL
    link.click(); // 触发下载
}
