
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const imageBox = document.querySelector('.image-box');
const clearAllBtn = document.getElementById('clearAllBtn');

let uploadedImages = [];

// Hacer clickeable el upload-zone si no hay imágenes
uploadZone.addEventListener('click', () => {
    if (uploadedImages.length === 0) {
        fileInput.click();
    }
});

// Hacer que el input funcione como dropzone
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    fileInput.files = files;
    handleFiles(files);
});

// Evento cuando se seleccionan archivos
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    uploadedImages = [];
    uploadZone.innerHTML = '';
    imageBox.innerHTML = '';
    uploadZone.classList.add('has-images');

    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const imageData = e.target.result;
                uploadedImages.push(imageData);
                
                // Crear elemento de imagen en uploadZone
                const previewWrapper = document.createElement('div');
                previewWrapper.className = 'image-preview-item';
                
                const previewDiv = document.createElement('div');
                previewDiv.className = 'preview-image';
                previewDiv.style.backgroundImage = `url('${imageData}')`;
                previewDiv.style.backgroundSize = 'cover';
                previewDiv.style.backgroundPosition = 'center';
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-image-btn';
                deleteBtn.textContent = '×';
                deleteBtn.addEventListener('click', () => {
                    const index = uploadedImages.indexOf(imageData);
                    if (index > -1) {
                        uploadedImages.splice(index, 1);
                        previewWrapper.remove();
                        removeImageFromViewer(index);
                        
                        if (uploadedImages.length === 0) {
                            uploadZone.innerHTML = '';
                            uploadZone.classList.remove('has-images');
                        }
                    }
                });
                
                previewWrapper.appendChild(previewDiv);
                previewWrapper.appendChild(deleteBtn);
                uploadZone.appendChild(previewWrapper);
                
                // Crear elemento de imagen en imageBox (viewer)
                const imageDiv = document.createElement('div');
                imageDiv.className = 'image';
                imageDiv.style.backgroundImage = `url('${imageData}')`;
                imageDiv.style.backgroundSize = 'cover';
                imageDiv.style.backgroundPosition = 'center';
                imageDiv.dataset.imageIndex = uploadedImages.length - 1;

                imageBox.appendChild(imageDiv);
            };
            
            reader.readAsDataURL(file);
        }
    }
}

function removeImageFromViewer(index) {
    const images = document.querySelectorAll('.image-box .image');
    images.forEach((img, i) => {
        if (i === index) {
            img.remove();
        }
    });
}

// Evento para eliminar todas las imágenes
clearAllBtn.addEventListener('click', () => {
    uploadedImages = [];
    imageBox.innerHTML = '';
    uploadZone.innerHTML = '';
    uploadZone.classList.remove('has-images');
    fileInput.value = '';
});
