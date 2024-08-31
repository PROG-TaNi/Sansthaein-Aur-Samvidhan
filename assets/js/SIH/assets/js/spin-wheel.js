document.addEventListener('DOMContentLoaded', function () {
    const spinButton = document.querySelector('.btn-spin');
    const spinner = document.querySelector('.spinner');
    const spinSound = document.getElementById('spinSound');
    const categories = [
        'Supreme Foundation',
        'Judicial Appointments',
        'Supreme Jurisdiction',
        'Powers of the Apex Court',
        'Supreme Procedures',
        'High Court Framework',
        'District Judiciary',
        'Subordinate Jurisdiction',
        'Judicial Protections',
        'Judicial Provisions'
    ];
    
    let spinning = false;

    // Create list items dynamically
    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category;
        spinner.appendChild(li);
    });

    spinButton.addEventListener('click', function () {
        if (spinning) return; // Prevent spinning while already spinning

        spinning = true;
        const randomIndex = Math.floor(Math.random() * categories.length);
        const selectedCategory = categories[randomIndex];
        const degrees = (360 / categories.length) * randomIndex + (360 * 3); // Rotate multiple times for effect

        // Play spin sound
        spinSound.play();

        // Add spinning animation
        spinner.style.transition = 'transform 4s ease-out';
        spinner.style.transform = `rotate(${degrees}deg)`;

        spinner.addEventListener('transitionend', function () {
            // Align the selected category to the top
            spinner.style.transition = 'none';
            spinner.style.transform = `rotate(${(360 / categories.length) * randomIndex}deg)`;
            
            spinning = false;

            // Redirect to the corresponding category page
            setTimeout(() => {
                window.location.href = `level.html?category=${encodeURIComponent(selectedCategory)}`;
            }, 1000);
        }, { once: true });
    });
});
