const fileInput = document.getElementById('file-input');
const chooseButton = document.getElementById('choose-button');
const uploadCard = document.getElementById('upload-card');
const uploadSection = document.getElementById('upload-section');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const previewFilename = document.getElementById('preview-filename');
const previewFilesize = document.getElementById('preview-filesize');
const previewDimensions = document.getElementById('preview-dimensions');
const analyzeButton = document.getElementById('analyze-button');
const chooseAnotherButton = document.getElementById('choose-another-button');
const analysisSection = document.getElementById('analysis-section');
const analysisSteps = document.querySelectorAll('#analysis-steps li');
const progressFill = document.getElementById('progress-fill');
const resultsSection = document.getElementById('results-section');
const analyzeAnotherButton = document.getElementById('analyze-another-button');

let currentObjectUrl = null;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

chooseButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

['dragover', 'dragenter'].forEach(eventName => {
  uploadCard.addEventListener(eventName, (e) => {
    e.preventDefault();
    uploadCard.classList.add('drag-over');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  uploadCard.addEventListener(eventName, (e) => {
    e.preventDefault();
    uploadCard.classList.remove('drag-over');
  });
});

uploadCard.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    alert("This file format isn't supported. Please upload a JPG, PNG, or WEBP image.");
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    alert('This image is too large. Please choose a file under 10MB.');
    return;
  }

  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = URL.createObjectURL(file);

  previewImage.src = currentObjectUrl;
  previewFilename.textContent = file.name;
  previewFilesize.textContent = formatFileSize(file.size);

  const tempImg = new Image();
  tempImg.onload = () => {
    previewDimensions.textContent = `${tempImg.naturalWidth} \u00d7 ${tempImg.naturalHeight}px`;
  };
  tempImg.onerror = () => {
    previewDimensions.textContent = 'Unknown';
  };
  tempImg.src = currentObjectUrl;

  showSection(previewSection);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showSection(sectionToShow) {
  [uploadSection, previewSection, analysisSection, resultsSection].forEach(section => {
    section.hidden = section !== sectionToShow;
  });
}

chooseAnotherButton.addEventListener('click', resetToUpload);
analyzeAnotherButton.addEventListener('click', resetToUpload);

function resetToUpload() {
  fileInput.value = '';
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  analysisSteps.forEach(step => step.classList.remove('active', 'done'));
  progressFill.style.width = '0%';
  showSection(uploadSection);
}

analyzeButton.addEventListener('click', runAnalysis);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runAnalysis() {
  showSection(analysisSection);
  analysisSteps.forEach(step => step.classList.remove('active', 'done'));
  progressFill.style.width = '0%';

  const totalSteps = analysisSteps.length;

  for (let i = 0; i < totalSteps; i++) {
    analysisSteps[i].classList.add('active');
    await delay(450);
    analysisSteps[i].classList.remove('active');
    analysisSteps[i].classList.add('done');
    progressFill.style.width = `${Math.round(((i + 1) / totalSteps) * 100)}%`;
  }

  await delay(300);
  showSection(resultsSection);
}
