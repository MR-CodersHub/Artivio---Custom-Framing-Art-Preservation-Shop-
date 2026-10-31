/**
 * Atelier & Archival - Quote Request Form, Estimator & FAQ Accordion
 * Client-side validation, live estimate calculator, file upload preview, FAQ accordion
 */

document.addEventListener('DOMContentLoaded', () => {
  initQuoteForm();
  initEstimator();
  initFaqAccordion();
  initDropzone();
});

/**
 * FAQ Accordion Functionality
 */
function initFaqAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isOpen = item.classList.contains('active');

      // Close other accordion items
      const parent = item.parentElement;
      if (parent) {
        parent.querySelectorAll('.accordion-item').forEach(other => {
          if (other !== item) other.classList.remove('active');
        });
      }

      // Toggle current item
      if (isOpen) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
}

/**
 * File Dropzone and Image Preview
 */
let uploadedFileData = null;

function initDropzone() {
  const dropzone = document.querySelector('.file-dropzone');
  const fileInput = document.getElementById('referenceImage');
  const previewBox = document.querySelector('.file-preview');
  const previewImg = document.querySelector('.file-preview-img');
  const previewName = document.querySelector('.file-preview-name');
  const previewSize = document.querySelector('.file-preview-size');
  const removeBtn = document.querySelector('.file-preview-remove');

  if (!dropzone || !fileInput) return;

  const handleFile = (file) => {
    if (!file) return;

    // Validate image file type
    if (!file.type.match('image.*')) {
      alert('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }

    // Max 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size must be under 10MB.');
      return;
    }

    uploadedFileData = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (previewImg) previewImg.src = e.target.result;
      if (previewName) previewName.textContent = file.name;
      if (previewSize) previewSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      if (previewBox) previewBox.style.display = 'flex';
      dropzone.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      uploadedFileData = null;
      fileInput.value = '';
      if (previewBox) previewBox.style.display = 'none';
      dropzone.style.display = 'block';
    });
  }
}

/**
 * Quote Request Form Client-Side Validation and Confirmation
 */
function initQuoteForm() {
  const form = document.getElementById('customQuoteForm');
  const feedback = document.getElementById('quoteFeedback');
  if (!form || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Field extractions
    const fullName = document.getElementById('fullName')?.value.trim();
    const email = document.getElementById('emailAddress')?.value.trim();
    const phone = document.getElementById('phoneNumber')?.value.trim();
    const artworkType = document.getElementById('artworkType')?.value;
    const dimensions = document.getElementById('dimensions')?.value.trim();
    const frameStyle = document.getElementById('frameStyle')?.value;
    const preservation = document.getElementById('preservationReq')?.value;
    const budget = document.getElementById('budgetRange')?.value;
    const instructions = document.getElementById('additionalNotes')?.value.trim();

    // Validation checks
    if (!fullName || !email || !phone || !artworkType || !dimensions || !frameStyle) {
      showFeedback('error', 'Please complete all required fields (marked with an asterisk *) before submitting your quote request.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFeedback('error', 'Please enter a valid email address.');
      return;
    }

    // Success confirmation: Honest client-side confirmation without claiming server dispatch
    const summaryHtml = `
      <div style="text-align: left; line-height: 1.7;">
        <h4 style="color: #2e7d32; margin-bottom: 0.5rem; font-family: var(--font-heading);">
          ✓ Quote Request Prepared Successfully!
        </h4>
        <p style="margin-bottom: 0.75rem; color: #1b5e20;">
          Thank you, <strong>${escapeHtml(fullName)}</strong>. Your custom framing specifications have been successfully compiled for your consultation review.
        </p>
        <div style="background: rgba(255,255,255,0.7); border: 1px solid #81c784; padding: 1rem; border-radius: 4px; font-size: 0.9rem; color: #252020;">
          <p><strong>Client:</strong> ${escapeHtml(fullName)} (${escapeHtml(email)} | ${escapeHtml(phone)})</p>
          <p><strong>Artwork:</strong> ${escapeHtml(artworkType)} — <strong>Dimensions:</strong> ${escapeHtml(dimensions)}</p>
          <p><strong>Frame Style:</strong> ${escapeHtml(frameStyle)}</p>
          <p><strong>Conservation Level:</strong> ${escapeHtml(preservation || 'Standard Archival')}</p>
          <p><strong>Estimated Budget:</strong> ${escapeHtml(budget || 'Flexible')}</p>
          ${instructions ? `<p><strong>Notes:</strong> ${escapeHtml(instructions)}</p>` : ''}
          ${uploadedFileData ? `<p><strong>Attached Reference:</strong> ${escapeHtml(uploadedFileData.name)} (${(uploadedFileData.size / 1024).toFixed(1)} KB)</p>` : ''}
        </div>
        <p style="margin-top: 0.85rem; font-size: 0.85rem; color: #388e3c;">
          <em>Note: This is a client-side specification preview. You may print this summary or bring your piece to our studio during business hours (Tue–Sat, 10am–6pm) for immediate physical profile matching and moulding selection.</em>
        </p>
      </div>
    `;

    showFeedback('success', summaryHtml);
    form.reset();

    // Reset dropzone
    const previewBox = document.querySelector('.file-preview');
    const dropzone = document.querySelector('.file-dropzone');
    if (previewBox) previewBox.style.display = 'none';
    if (dropzone) dropzone.style.display = 'block';
    uploadedFileData = null;
  });

  function showFeedback(type, messageHtml) {
    feedback.className = `form-feedback ${type}`;
    feedback.innerHTML = messageHtml;
    feedback.style.display = 'block';
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Interactive Live Price & Materials Estimator Preview
 */
function initEstimator() {
  const widthInput = document.getElementById('estWidth');
  const heightInput = document.getElementById('estHeight');
  const styleSelect = document.getElementById('estStyle');
  const glassSelect = document.getElementById('estGlass');
  const matSelect = document.getElementById('estMat');
  const resultBox = document.getElementById('estResult');

  if (!widthInput || !heightInput || !styleSelect || !glassSelect || !resultBox) return;

  const calculateEstimate = () => {
    const width = parseFloat(widthInput.value) || 0;
    const height = parseFloat(heightInput.value) || 0;
    const styleMultiplier = parseFloat(styleSelect.value) || 1.0;
    const glassMultiplier = parseFloat(glassSelect.value) || 1.0;
    const matAddon = parseFloat(matSelect ? matSelect.value : 0) || 0;

    if (width <= 0 || height <= 0) {
      resultBox.innerHTML = `
        <div style="text-align: center; color: var(--charcoal-muted); padding: 1.5rem 0;">
          <p>Enter your artwork dimensions to see an instant artisanal framing estimate.</p>
        </div>
      `;
      return;
    }

    // United inches formula common in fine art framing: (Width + Height)
    const unitedInches = width + height;
    const baseCost = unitedInches * 4.2;
    const calculatedMin = Math.round((baseCost * styleMultiplier * glassMultiplier + matAddon) * 0.9);
    const calculatedMax = Math.round((baseCost * styleMultiplier * glassMultiplier + matAddon) * 1.15);

    resultBox.innerHTML = `
      <div style="background-color: var(--soft-ivory); border: 2px solid var(--muted-gold); border-radius: 4px; padding: 1.5rem; text-align: center;">
        <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--burnt-orange); font-weight: 700; display: block; margin-bottom: 0.35rem;">
          Estimated Artivio Framing Range
        </span>
        <div style="font-family: var(--font-heading); font-size: 2.2rem; color: var(--charcoal-black); font-weight: 700; margin-bottom: 0.5rem;">
          $${calculatedMin} — $${calculatedMax}
        </div>
        <p style="font-size: 0.88rem; color: var(--charcoal-soft); margin-bottom: 0.75rem;">
          Based on ${width}" × ${height}" (${unitedInches} United Inches) with archival mounting, acid-free backing, and precision museum joinery.
        </p>
        <span style="font-size: 0.78rem; color: var(--charcoal-muted); display: block;">
          Final quote confirmed after hands-on artwork inspection in our studio.
        </span>
      </div>
    `;
  };

  [widthInput, heightInput, styleSelect, glassSelect, matSelect].forEach(el => {
    if (el) el.addEventListener('input', calculateEstimate);
  });

  // Calculate default
  calculateEstimate();
}

/**
 * Utility HTML Escape
 */
function escapeHtml(string) {
  if (!string) return '';
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}
