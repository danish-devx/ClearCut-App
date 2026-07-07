document.addEventListener('DOMContentLoaded', () => {
    
   
    const key = 'd0e2b8ec97183d303ffacdf49718ab8b73142be5ca6d7772ffeda09422726ac2cd4af44e8b55ccc2d40dd30f903ab5e8';

  
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processBtn');
    const resetBtn = document.getElementById('resetBtn');
    const viewerPlaceholder = document.getElementById('viewerPlaceholder');
    const spltContainer = document.getElementById('splitContainer');
    const originalPreview = document.getElementById('originalPreview');
    const resultPreview = document.getElementById('resultPreview');
    const downloadHub = document.getElementById('downloadHub');
    const downloadBtn = document.getElementById('downloadBtn');

    let targetFile = null;
    let processedImageBlobUrl = null; 

  
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

  
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

   
    ['dragenter', 'dragover'].forEach(env => {
        dropZone.addEventListener(env, (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(env => {
        dropZone.addEventListener(env, (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

  
    function handleFile(file) {
       
        if (file.size > 10 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'Asset Too Large',
                text: 'Maximum allowed transmission size is 10MB.',
                background: 'rgba(18, 22, 28, 0.95)',
                color: '#f5f7fa',
                confirmButtonColor: '#ff7800'
            });
            return;
        }

      
        if (!file.type.startsWith('image/')) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Asset Format',
                text: 'Please feed a valid image file (PNG, JPG, WEBP).',
                background: 'rgba(18, 22, 28, 0.95)',
                color: '#f5f7fa',
                confirmButtonColor: '#ff7800'
            });
            return;
        }

        targetFile = file;

       
        const reader = new FileReader();
        reader.onload = (e) => {
            originalPreview.src = e.target.result;
            resultPreview.src = ''; 
            
            
            viewerPlaceholder.style.display = 'none';
            spltContainer.style.display = 'grid';
            processBtn.disabled = false;
            resetBtn.style.display = 'flex';
            downloadHub.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

  
    processBtn.addEventListener('click', async () => {
        if (!targetFile) return;

       
        if (!key || key.trim() === "") {
            Swal.fire({
                icon: 'warning',
                title: 'API Key Missing',
                text: 'Please insert your Clipdrop API key configuration string.',
                background: 'rgba(18, 22, 28, 0.95)',
                color: '#f5f7fa',
                confirmButtonColor: '#ff7800'
            });
            return;
        }

        
        processBtn.disabled = true;
        processBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Isolating Background...';

        const formData = new FormData();
        formData.append('image_file', targetFile);

        try {
            const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
                method: 'POST',
                headers: { 'x-api-key': key },
                body: formData
            });

            if (!response.ok) throw new Error('API Error');

          
            const imageBlob = await response.blob();
            processedImageBlobUrl = URL.createObjectURL(imageBlob);
            resultPreview.src = processedImageBlobUrl;
            
           
            processBtn.innerHTML = '<i class="fa-solid fa-check"></i> Isolated Successfully';
            downloadHub.style.display = 'flex';
            
            Swal.fire({
                icon: 'success',
                title: 'Extraction Perfected',
                text: 'The AI core has isolated the alpha channel seamlessly.',
                background: 'rgba(18, 22, 28, 0.95)',
                color: '#f5f7fa',
                confirmButtonColor: '#00c6ff'
            });

        } catch (error) {
            console.error(error);
            processBtn.disabled = false;
            processBtn.innerHTML = '<i class="fa-solid fa-scissors"></i> Remove Background';
            
            Swal.fire({
                icon: 'error',
                title: 'Processing Failed',
                text: 'Failed to communicate with AI Engine. Check your credits or network.',
                background: 'rgba(18, 22, 28, 0.95)',
                color: '#f5f7fa',
                confirmButtonColor: '#ff7800'
            });
        }
    });

    
    resetBtn.addEventListener('click', () => {
        targetFile = null;
        fileInput.value = '';
        originalPreview.src = '';
        resultPreview.src = '';
        
        if (processedImageBlobUrl) {
            URL.revokeObjectURL(processedImageBlobUrl);
            processedImageBlobUrl = null;
        }
        
        spltContainer.style.display = 'none';
        downloadHub.style.display = 'none';
        viewerPlaceholder.style.display = 'flex';
        
        processBtn.disabled = true;
        processBtn.innerHTML = '<i class="fa-solid fa-scissors"></i> Remove Background';
        resetBtn.style.display = 'none';
    });

   
    downloadBtn.addEventListener('click', () => {
        if (!processedImageBlobUrl) return;
        const link = document.createElement('a');
        link.download = `clearcut_${Date.now()}.png`;
        link.href = processedImageBlobUrl;
        link.click();
    });
});


