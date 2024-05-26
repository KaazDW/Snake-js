// https://github.com/KaazDW/Tooltiper

document.addEventListener('DOMContentLoaded', function () {
    let labels = document.querySelectorAll('.tooltip-container');

    labels.forEach(function (label) {
        let tooltipText = label.getAttribute('data-tooltip');
        let words = tooltipText.split(' ');
        let tooltipContent = '';

        for (let i = 0; i < words.length; i++) {
            tooltipContent += words[i];
            if ((i + 1) % 7 === 0 && i !== words.length - 1) {
                tooltipContent += '<br>';
            } else {
                tooltipContent += ' ';
            }
        }

        let tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = tooltipContent; 

        label.appendChild(tooltip);

        label.addEventListener('mouseover', function () {
            tooltip.style.opacity = '1';
        });

        label.addEventListener('mouseout', function () {
            tooltip.style.opacity = '0';
        });
    });
});
