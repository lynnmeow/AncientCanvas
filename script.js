// ======================
// 字体加载状态管理
// ======================

// 在文件开头添加字体加载相关的变量和函数
let isFontLoaded = false;
const fontFamily = '"XiangcuiDazijitiW15-Regular"';

// 字体加载检查函数（增加超时机制）
async function checkFontLoaded() {
    try {
        // 增加重试机制
        let retries = 3;
        while (retries-- > 0) {
            const loaded = document.fonts.check(`32px ${fontFamily}`);
            if (loaded) return true;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return false;
    } catch (error) {
        console.error('字体加载检查失败:', error);
        return false;
    }
}

// ======================
// 字体加载状态管理（增强版）
// ======================
async function initFontLoading() {
    const fontLoadStatus = document.getElementById('font-load-status');
    const generateButton = document.getElementById('generate-button');

    // 强制设置初始状态
    generateButton.style.display = 'none';
    fontLoadStatus.style.display = 'block';
    fontLoadStatus.textContent = '正在加载字体文件，请稍候';
    document.body.style.cursor = 'wait';

    try {
        // 修改字体路径为相对路径（重要修复）
        const font = new FontFace(fontFamily, 'url(./XiangcuiDazijitiW15-Regular.woff2)', {
            display: 'swap'
        });

        // 增加超时处理
        const loadPromise = font.load();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('字体加载超时 (60秒)')), 60000)
        );

        await Promise.race([loadPromise, timeoutPromise]);
        document.fonts.add(font);

        // 增强验证逻辑
        let retries = 5;
        while (retries-- > 0) {
            if (await checkFontLoaded()) break;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 最终验证使用实际渲染尺寸
        isFontLoaded = document.fonts.check(`32px ${fontFamily}`);
        
        if (!isFontLoaded) {
            throw new Error('字体最终验证未通过');
        }

        generateButton.style.display = 'block';
        fontLoadStatus.style.display = 'none';

    } catch (error) {
        console.error('字体加载失败:', error);
        fontLoadStatus.innerHTML = `
            字体加载失败：<br>
            ${error.message}<br>
            60秒后自动刷新...
        `;
        setTimeout(() => location.reload(), 60000);
    } finally {
        document.body.style.cursor = 'default';
    }
}

// ======================
// 全局状态变量
// ======================
let selectedColor = '#BE3535'; // 当前选中的背景颜色
let decorationColor = 'gold';   // 当前选中的装饰颜色

// ======================
// DOM加载完成事件
// ======================
document.addEventListener('DOMContentLoaded', function() {
    initFontLoading();
    
    // 获取颜色选择器元素
    const bgColorOptions = document.querySelectorAll('.color-picker:not(.decoration-color) .color-option');
    const decorColorOptions = document.querySelectorAll('.decoration-color .color-option');

    // ----------------------
    // 背景颜色选择逻辑
    // ----------------------
    bgColorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除所有背景选项的选中状态
            bgColorOptions.forEach(opt => opt.classList.remove('selected'));
            // 设置当前选中状态
            this.classList.add('selected');
            // 更新全局颜色变量
            selectedColor = this.dataset.color;
        });
    });

    // ----------------------
    // 装饰颜色选择逻辑
    // ----------------------
    decorColorOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            // 移除所有装饰选项的选中状态
            decorColorOptions.forEach(opt => opt.classList.remove('selected'));
            // 设置当前选中状态
            this.classList.add('selected');
            
            // 获取实际计算颜色值（修复配置不符问题）
            const computedColor = getComputedStyle(this).backgroundColor;
            decorationColor = computedColor;
            
            // 在控制台打印调试信息
            console.log('[装饰颜色] 当前选择:', {
                element: this,
                dataColor: this.dataset.color,
                computedColor: computedColor,
                appliedColor: decorationColor
            });
        });
    });

    // 设置默认选中状态
    if (bgColorOptions.length > 0) {
        bgColorOptions[0].click(); // 通过触发点击事件设置初始值
    }
    if (decorColorOptions.length > 0) {
        decorColorOptions[0].click(); // 通过触发点击事件设置初始值
    }
});

// ======================
// 图片生成逻辑
// ======================
document.getElementById('generate-button').addEventListener('click', async function() {
    // 再次检查字体加载状态
    if (!isFontLoaded) {
        alert('字体尚未加载完成，请稍后重试');
        return;
    }

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

    // 在图片生成逻辑开头添加基础字号定义
    let baseFontSize = 32; // 根据实际需求调整基础字号

    // 设置字体和样式
    ctx.fillStyle = 'white';
    ctx.font = `${baseFontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 背景颜色和装饰
    ctx.fillStyle = selectedColor;  // 使用选中的背景颜色
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 金色不规则装饰 → 改为动态颜色
    ctx.fillStyle = decorationColor;
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
        
        // 调整透明度设置位置（修复bug）
        if (decorationColor === 'gold') {
            ctx.globalAlpha = 0.8;
        } else if (decorationColor === 'silver') {
            ctx.globalAlpha = 0.8;
        } else {
            ctx.globalAlpha = 0.8;
        }
        ctx.fill();
        ctx.restore(); // 确保恢复画布状态
    }

    // 设置文本颜色
    const textColor = isLightColor(selectedColor) ? '#1c1414' : '#F4E1B0';
    ctx.fillStyle = textColor;

    // 计算适合的字号
    function calculateOptimalFontSize(text, maxWidth, maxHeight, baseSize) {
        const minSize = Math.max(baseSize * 0.8, 24); // 最小字号不小于24px或基础字号的80%
        const maxSize = baseSize * 1.3; // 最大字号为基础字号的1.3倍
        const step = 2;
        
        for (let size = maxSize; size >= minSize; size -= step) {
            ctx.font = `${size}px ${fontFamily}`;
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
        
        ctx.font = `${fontSize}px ${fontFamily}`;
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
        ctx.font = `${fontSize}px ${fontFamily}`;
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

// ======================
// 辅助函数
// ======================
function isLightColor(hexColor) {
    // 将十六进制颜色转换为RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // 计算亮度 (基于人眼对不同颜色的敏感度)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128; // 亮度大于128认为是浅色
}

function downloadImage() {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a'); // 创建临时链接
    link.download = 'generated-image.png'; // 设置下载文件名
    link.href = canvas.toDataURL('image/png'); // 将画布内容转换为图片URL
    link.click(); // 触发下载
}
