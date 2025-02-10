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
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 10 + 5;
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

    // 设置文本样式
    ctx.fillStyle = '#F4E1B0';  // 浅黄色字体

    // 优化后的水平文本换行函数（支持手动换行）
    function drawWrappedText(text, x, y, maxWidth, fontSize) {
        ctx.font = `${fontSize}px "XiangcuiDazijitiW15-Regular"`;
        ctx.textAlign = 'left';
        const lineHeight = fontSize * 1.5;
        let maxLineY = y;

        // 处理手动换行
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
            maxLineY = lineY + lineHeight; // 段落之间增加一个行距
        });

        return maxLineY; // 返回文本底部位置
    }

    // 优化后的竖排文本换行函数（从右向左换行）
    function drawVerticalWrappedText(text, startX, startY, maxHeight, fontSize, alignment = 'top', verticalAlign = 'top') {
        ctx.font = `${fontSize}px "XiangcuiDazijitiW15-Regular"`;
        ctx.textAlign = 'center';
        const lineHeight = fontSize * 1.5;
        
        // 预处理文本，处理破折号
        text = text.replace(/——/g, '︱︱'); // 将中文破折号替换为竖线
        
        // 处理手动换行，并计算每段文字的高度
        const lines = text.split('\n');
        const columnWidth = fontSize * 2;
        let totalWidth = 0;
        let maxColumnHeight = 0;
        
        // 计算每段文字需要的列数和总宽度
        const linesInfo = lines.map(line => {
            const chars = line.split('');
            const columnHeight = chars.length * lineHeight;
            const columnsNeeded = Math.ceil(columnHeight / (maxHeight * 0.8));
            totalWidth += columnsNeeded * columnWidth;
            maxColumnHeight = Math.max(maxColumnHeight, Math.min(columnHeight, maxHeight * 0.8));
            return {
                chars,
                columnsNeeded,
                columnHeight
            };
        });

        // 计算垂直位置
        let actualStartY = startY;
        if (verticalAlign === 'bottom') {
            actualStartY = canvas.height - padding - maxColumnHeight;
        }
        
        // 计算水平起始位置
        let actualStartX = startX;
        if (alignment === 'right') {
            // 计算右侧文本的中心位置
            const centerX = canvas.width - (canvas.width - padding) / 4;
            actualStartX = centerX + totalWidth / 2;
        } else {
            actualStartX = startX + totalWidth - columnWidth;
        }

        // 从右向左绘制每一段文字
        linesInfo.forEach(lineInfo => {
            const { chars, columnsNeeded } = lineInfo;
            const charsPerColumn = Math.ceil(chars.length / columnsNeeded);
            
            // 将字符分配到每一列
            for (let col = 0; col < columnsNeeded; col++) {
                let currentY = actualStartY;
                const startChar = col * charsPerColumn;
                const endChar = Math.min((col + 1) * charsPerColumn, chars.length);
                
                // 绘制当前列的字符
                for (let i = startChar; i < endChar; i++) {
                    ctx.fillText(chars[i], actualStartX, currentY);
                    currentY += lineHeight;
                }
                
                // 向左移动到下一列
                if (alignment === 'right') {
                    actualStartX -= columnWidth;
                } else {
                    actualStartX += columnWidth;
                }
            }
        });

        return {
            width: totalWidth,
            height: maxColumnHeight
        };
    }

    // 计算可用空间和边距
    const padding = 50;
    const maxFirstTextWidth = canvas.width - (padding * 2);

    // 绘制第一段文本
    const firstTextBottom = drawWrappedText(
        text1,
        padding,
        padding + 32,
        maxFirstTextWidth,
        36
    );

    // 计算第二和第三段文本的可用高度
    const availableHeight = canvas.height - padding * 2;

    // 绘制第二段文本（右侧中间对齐）
    const text2Metrics = drawVerticalWrappedText(
        text2,
        canvas.width - padding,
        padding,
        availableHeight,
        30,
        'right',
        'bottom'
    );

    // 绘制第三段文本（左下角）
    const text3Metrics = drawVerticalWrappedText(
        text3,
        padding,
        padding,
        availableHeight,
        30,
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
