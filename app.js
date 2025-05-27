let resumeFile = null;
let reviewStatus = 'pending';
let reviewFeedback = '';
let userNotified = false;
let adminNotified = false;

function getRole() {
    return document.getElementById('role').value;
}

// Navigation
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(div => div.style.display = 'none');
}
function showDashboard() {
    hideAllScreens();
    document.getElementById('dashboardScreen').style.display = '';
    // update dashboard state if needed
}
function navigateTo(screenId) {
    hideAllScreens();
    document.getElementById(screenId).style.display = '';
    if (screenId === 'uploadScreen') renderUploadScreen();
    if (screenId === 'reviewScreen') renderReviewScreen();
    if (screenId === 'editScreen') renderEditScreen();
    if (screenId === 'downloadScreen') renderDownloadScreen();
}

// ---- Upload Resume ----
function renderUploadScreen() {
    document.getElementById('uploadFileName').textContent = resumeFile ? resumeFile.name : '';
    document.getElementById('uploadMessage').textContent = '';
    document.getElementById('resumeInput').value = '';
}
function submitUpload() {
    let input = document.getElementById('resumeInput');
    let msg = document.getElementById('uploadMessage');
    if (!input.files || !input.files[0]) {
        msg.textContent = 'Please select a file.';
        msg.className = 'message';
        return;
    }
    let file = input.files[0];
    let validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    let maxSize = 5 * 1024 * 1024;
    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
        msg.textContent = 'Only PDF and DOCX files are allowed.';
        msg.className = 'message';
        return;
    }
    if (file.size > maxSize) {
        msg.textContent = 'File size exceeds 5MB limit.';
        msg.className = 'message';
        return;
    }
    resumeFile = file;
    reviewStatus = 'pending';
    reviewFeedback = '';
    msg.textContent = 'Resume uploaded successfully!';
    msg.className = 'message success';
    document.getElementById('uploadFileName').textContent = file.name;
    setTimeout(() => { showDashboard(); }, 1200);
}

// ---- Review Resume ----
function renderReviewScreen() {
    const role = getRole();
    let content = '';
    if (!resumeFile) {
        content = `<div class="message">No resume uploaded yet.</div>`;
    } else if (role === 'admin') {
        content = `
            <div class="adminFileName"><b>File:</b> ${resumeFile.name} (${(resumeFile.size/1024).toFixed(2)} KB)</div>
            <button onclick="downloadResume()">Download Resume</button>
            <div style="margin-top:10px;">
                <label>Review Status:
                    <select id="reviewStatus" onchange="setReviewStatus()">
                        <option value="pending" ${reviewStatus === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="reviewed" ${reviewStatus === 'reviewed' ? 'selected' : ''}>Reviewed</option>
                    </select>
                </label>
            </div>
            <textarea id="feedback" placeholder="Add feedback/comments">${reviewFeedback||''}</textarea>
            <div class="uc-btns">
                <button onclick="submitReview()">Submit Review</button>
            </div>
            <div id="reviewMessage" class="message"></div>
        `;
    } else { // user
        content = `
            <div class="fileName"><b>File:</b> ${resumeFile ? resumeFile.name : 'No resume uploaded yet.'}</div>
            <div class="notify">
                ${reviewFeedback ? `<b>Admin/HR Feedback:</b> "${reviewFeedback}"<br>Status: ${reviewStatus}` : 'No feedback yet.'}
            </div>
        `;
    }
    document.getElementById('adminReviewContent').innerHTML = content;
}
function setReviewStatus() {
    reviewStatus = document.getElementById('reviewStatus').value;
}
function submitReview() {
    const feedback = document.getElementById('feedback').value.trim();
    const msg = document.getElementById('reviewMessage');
    if (!feedback) {
        msg.textContent = 'Feedback cannot be empty.';
        msg.className = 'message';
        return;
    }
    reviewFeedback = feedback;
    reviewStatus = document.getElementById('reviewStatus').value;
    userNotified = true;
    msg.textContent = 'Review submitted and user notified.';
    msg.className = 'message success';
    setTimeout(() => { showDashboard(); }, 1200);
}

// ---- Edit Resume ----
function renderEditScreen() {
    document.getElementById('editFileName').textContent = resumeFile ? resumeFile.name : '';
    document.getElementById('editMessage').textContent = '';
    document.getElementById('editInput').value = '';
    document.getElementById('editBtn').disabled = !resumeFile;
}
function submitEdit() {
    let input = document.getElementById('editInput');
    let msg = document.getElementById('editMessage');
    if (!input.files || !input.files[0]) {
        msg.textContent = 'Please select a file.';
        msg.className = 'message';
        return;
    }
    let file = input.files[0];
    let validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    let maxSize = 5 * 1024 * 1024;
    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
        msg.textContent = 'Only PDF and DOCX files are allowed.';
        msg.className = 'message';
        return;
    }
    if (file.size > maxSize) {
        msg.textContent = 'File size exceeds 5MB limit.';
        msg.className = 'message';
        return;
    }
    resumeFile = file;
    reviewStatus = 'pending';
    reviewFeedback = '';
    adminNotified = true;
    msg.textContent = 'Resume re-uploaded! Admin/HR notified.';
    msg.className = 'message success';
    document.getElementById('editFileName').textContent = file.name;
    setTimeout(() => { showDashboard(); }, 1200);
}

// ---- Download Resume ----
function renderDownloadScreen() {
    document.getElementById('downloadFileName').textContent = resumeFile ? resumeFile.name : 'No resume uploaded yet.';
    document.getElementById('downloadBtn').disabled = !resumeFile;
    document.getElementById('downloadMessage').textContent = '';
}
function downloadResume() {
    if (!resumeFile) return;
    const url = URL.createObjectURL(resumeFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = resumeFile.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        document.getElementById('downloadMessage').textContent = 'Download successful!';
        document.getElementById('downloadMessage').className = 'message success';
    }, 100);
}

// Initial load
window.onload = showDashboard;