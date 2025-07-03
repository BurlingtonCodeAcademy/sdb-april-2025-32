// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/student';

// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentsGrid = document.getElementById('studentsGrid');
const loading = document.getElementById('loading');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const refreshBtn = document.getElementById('refreshBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const messageContainer = document.getElementById('messageContainer');

// State Management
let editingStudentId = null;
let students = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    studentForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
    refreshBtn.addEventListener('click', loadStudents);
    deleteAllBtn.addEventListener('click', handleDeleteAll);
}

// API Functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        throw new Error(error.message || 'Network error occurred');
    }
}

async function createStudent(studentData) {
    return apiRequest(`${API_BASE_URL}/new`, {
        method: 'POST',
        body: JSON.stringify(studentData)
    });
}

async function getStudents() {
    return apiRequest(API_BASE_URL);
}

async function updateStudent(id, studentData) {
    return apiRequest(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(studentData)
    });
}

async function deleteStudent(id) {
    return apiRequest(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
    });
}

async function deleteAllStudents() {
    return apiRequest(API_BASE_URL, {
        method: 'DELETE'
    });
}

// UI Functions
function showMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;

    messageContainer.appendChild(messageElement);

    // Trigger animation
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 100);

    // Remove after 4 seconds
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
    }, 4000);
}

function showLoading() {
    loading.style.display = 'block';
    studentsGrid.innerHTML = '';
}

function hideLoading() {
    loading.style.display = 'none';
}

function clearForm() {
    studentForm.reset();
    editingStudentId = null;
    submitBtn.textContent = 'Add Student';
    cancelBtn.style.display = 'none';
    document.querySelector('.form-section h2').textContent = 'Add New Student';
}

function populateForm(student) {
    document.getElementById('firstName').value = student.firstName;
    document.getElementById('lastName').value = student.lastName;
    document.getElementById('email').value = student.email;
    document.getElementById('password').value = ''; // Don't populate password for security

    editingStudentId = student._id;
    submitBtn.textContent = 'Update Student';
    cancelBtn.style.display = 'inline-block';
    document.querySelector('.form-section h2').textContent = 'Edit Student';

    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function renderStudents() {
    if (students.length === 0) {
        studentsGrid.innerHTML = `
            <div class="no-students">
                <h3>No Students Found</h3>
                <p>Add your first student using the form above to get started!</p>
            </div>
        `;
        return;
    }

    studentsGrid.innerHTML = students.map(student => `
        <div class="student-card">
            <div class="student-info">
                <h3>${escapeHtml(student.firstName)} ${escapeHtml(student.lastName)}</h3>
                <p><strong>Email:</strong> ${escapeHtml(student.email)}</p>
                <p><strong>ID:</strong> ${escapeHtml(student._id)}</p>
                <p><strong>Created:</strong> ${new Date(student.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
            <div class="student-actions">
                <button class="edit-btn" onclick="editStudent('${student._id}')">Edit</button>
                <button class="delete-btn" onclick="confirmDeleteStudent('${student._id}', '${escapeHtml(student.firstName)} ${escapeHtml(student.lastName)}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Handlers
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(studentForm);
    const studentData = {
        firstName: formData.get('firstName').trim(),
        lastName: formData.get('lastName').trim(),
        email: formData.get('email').trim(),
        password: formData.get('password')
    };

    // Basic validation
    if (!studentData.firstName || !studentData.lastName || !studentData.email || !studentData.password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (studentData.password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = editingStudentId ? 'Updating...' : 'Adding...';

        if (editingStudentId) {
            await updateStudent(editingStudentId, studentData);
            showMessage('Student updated successfully!', 'success');
        } else {
            await createStudent(studentData);
            showMessage('Student added successfully!', 'success');
        }

        clearForm();
        loadStudents();

    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingStudentId ? 'Update Student' : 'Add Student';
    }
}

async function loadStudents() {
    try {
        showLoading();
        const response = await getStudents();
        students = response.students || [];
        renderStudents();
        showMessage(`Loaded ${students.length} students`, 'success');
    } catch (error) {
        showMessage(error.message, 'error');
        students = [];
        renderStudents();
    } finally {
        hideLoading();
    }
}

function editStudent(id) {
    const student = students.find(s => s._id === id);
    if (student) {
        populateForm(student);
    }
}

function cancelEdit() {
    clearForm();
    showMessage('Edit cancelled', 'info');
}

function confirmDeleteStudent(id, name) {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
        handleDeleteStudent(id);
    }
}

async function handleDeleteStudent(id) {
    try {
        await deleteStudent(id);
        showMessage('Student deleted successfully!', 'success');
        loadStudents();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function handleDeleteAll() {
    if (students.length === 0) {
        showMessage('No students to delete', 'info');
        return;
    }

    if (confirm(`Are you sure you want to delete all ${students.length} students? This action cannot be undone.`)) {
        try {
            deleteAllBtn.disabled = true;
            deleteAllBtn.textContent = 'Deleting...';

            const response = await deleteAllStudents();
            showMessage(`Successfully deleted ${response.deletedCount} students`, 'success');
            loadStudents();
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            deleteAllBtn.disabled = false;
            deleteAllBtn.textContent = 'Delete All';
        }
    }
}

// Global functions for onclick handlers
window.editStudent = editStudent;
window.confirmDeleteStudent = confirmDeleteStudent;