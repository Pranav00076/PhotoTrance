document.addEventListener('DOMContentLoaded', () => {
    // 1. Create the Upload Modal
    const modalHtml = `
    <div id="uploadModal" class="upload-modal" style="display: none;">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Upload Image</h2>
            <form id="uploadForm">
                <input type="file" id="imageInput" accept="image/*" required>
                <select id="categorySelect" required>
                    <option value="" disabled selected>Select Category</option>
                    <option value="Showcase">Showcase (Home Page)</option>
                    <option value="Nature">Nature (Genre Page)</option>
                    <option value="Wildlife">Wildlife (Genre Page)</option>
                    <option value="Still Life">Still Life (Genre Page)</option>
                    <option value="Sky">Sky (Genre Page)</option>
                    <option value="Landscape">Landscape (Landscape Page)</option>
                    <option value="Potrait">Portrait (Portrait Page)</option>
                </select>
                <button type="submit">Upload & Save</button>
            </form>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 2. Add 'Upload' link to Nav if not exists
    const navUl = document.querySelector('nav ul');
    if (navUl && !document.getElementById('uploadLink')) {
        const li = document.createElement('li');
        li.innerHTML = '<a href="#" id="uploadLink">UPLOAD +</a>';
        navUl.appendChild(li);
    }

    // Modal Logic
    const uploadModal = document.getElementById('uploadModal');
    const uploadLink = document.getElementById('uploadLink');
    const closeBtn = document.querySelector('.close-btn');

    if (uploadLink) {
        uploadLink.addEventListener('click', (e) => {
            e.preventDefault();
            uploadModal.style.display = 'flex';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            uploadModal.style.display = 'none';
        });
    }

    // 3. Handle Form Submit
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('imageInput');
            const categorySelect = document.getElementById('categorySelect');
            const file = fileInput.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64String = event.target.result;
                    const newImage = {
                        id: Date.now(),
                        category: categorySelect.value,
                        src: base64String
                    };
                    
                    // Save to localStorage
                    let uploads = JSON.parse(localStorage.getItem('photoTranceUploads') || '[]');
                    uploads.unshift(newImage); // add to beginning
                    localStorage.setItem('photoTranceUploads', JSON.stringify(uploads));
                    
                    uploadModal.style.display = 'none';
                    uploadForm.reset();
                    
                    // Inject immediately if we are on the right page
                    renderImages();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 4. Render Images based on current page
    function renderImages() {
        const uploads = JSON.parse(localStorage.getItem('photoTranceUploads') || '[]');
        const currentPage = window.location.pathname;

        uploads.forEach(imgData => {
            // Check if it's already rendered
            if (document.getElementById(`upload-${imgData.id}`)) return;

            const imgEl = document.createElement('img');
            imgEl.src = imgData.src;
            imgEl.id = `upload-${imgData.id}`;

            let targetContainer = null;

            // Determine target container based on category and page
            if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('PhotoTrance/')) {
                if (imgData.category === 'Showcase') {
                     targetContainer = document.getElementById('Showcase');
                }
            } else if (currentPage.includes('landscape.html')) {
                if (imgData.category === 'Landscape') {
                     // The landscape page has a bigcont div
                     targetContainer = document.querySelector('.bigcont');
                }
            } else if (currentPage.includes('Potrait.html')) {
                if (imgData.category === 'Potrait') {
                     targetContainer = document.querySelector('.bigcont');
                }
            } else if (currentPage.includes('genre.html')) {
                // Genres have specific rows.
                const conts = document.querySelectorAll('.cont');
                if (imgData.category === 'Nature' && conts.length >= 2) targetContainer = conts[1]; // second row1
                else if (imgData.category === 'Wildlife' && conts.length >= 4) targetContainer = conts[3]; // second row2
                else if (imgData.category === 'Still Life') targetContainer = document.getElementById('row3');
                else if (imgData.category === 'Sky') targetContainer = document.getElementById('row4');
            }

            if (targetContainer) {
                if (currentPage.includes('genre.html')) {
                    const imgBox = document.createElement('div');
                    imgBox.className = 'imgbox';
                    imgBox.appendChild(imgEl);
                    targetContainer.appendChild(imgBox);
                } else {
                    // Prepend so new images show up first!
                    targetContainer.insertBefore(imgEl, targetContainer.firstChild);
                }
            }
        });
    }

    renderImages();
});
