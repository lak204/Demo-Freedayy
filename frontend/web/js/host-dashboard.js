/**
 * Host Dashboard JavaScript - Freeday Web
 * This file handles all the functionality for the host dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the host dashboard
    initHostDashboard();
});

// Global variables
let hostEvents = [];
let hostBookings = [];
let categories = [];
let hostProfile = null;

/**
 * Initialize the host dashboard
 */
async function initHostDashboard() {
    // Check if user is logged in and is a host
    const currentUser = getStoredUser();
    if (!currentUser) {
        // Redirect to login if not logged in
        window.location.href = 'login.html?redirect=host-dashboard.html';
        return;
    }
    
    // Update UI for auth status
    updateUIForAuthStatus();

    // Load host profile
    await loadHostProfile();
    
    // Initialize tab navigation
    initTabs();
    
    // Initialize event listeners
    initEventListeners();
    
    // Load initial data
    await Promise.all([
        loadCategories(),
        loadHostEvents(),
        loadHostBookings()
    ]);
    
    // Show verification banner if not verified
    updateVerificationBanner();
}

/**
 * Initialize tab navigation
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(`${tabName}Tab`).classList.add('active');
        });
    });
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Create Event button
    document.getElementById('createEventBtn').addEventListener('click', openCreateEventModal);
    document.getElementById('createFirstEventBtn')?.addEventListener('click', openCreateEventModal);
    
    // Event modal
    document.getElementById('closeEventModal').addEventListener('click', closeEventModal);
    document.getElementById('cancelEventBtn').addEventListener('click', closeEventModal);
    document.getElementById('eventForm').addEventListener('submit', handleEventFormSubmit);
    
    // File uploads
    document.getElementById('eventImage').addEventListener('change', handleEventImageChange);
    document.getElementById('cccdImage').addEventListener('change', handleCCCDImageChange);
    
    // Host profile form
    document.getElementById('hostProfileForm').addEventListener('submit', handleHostProfileSubmit);
    
    // Verify host button
    document.getElementById('verifyHostBtn')?.addEventListener('click', scrollToHostSettings);
    
    // Booking modal
    document.getElementById('closeBookingModal').addEventListener('click', closeBookingModal);
    document.getElementById('confirmBookingBtn').addEventListener('click', confirmBooking);
    document.getElementById('cancelBookingBtn').addEventListener('click', cancelBooking);
    document.getElementById('markAttendedBtn').addEventListener('click', markBookingAttended);
    
    // Filters
    document.getElementById('eventStatusFilter').addEventListener('change', filterHostEvents);
    document.getElementById('bookingStatusFilter').addEventListener('change', filterHostBookings);
    document.getElementById('bookingEventFilter').addEventListener('change', filterHostBookings);
    document.getElementById('eventSearch').addEventListener('input', debounce(filterHostEvents, 300));
}

/**
 * Load host profile
 */
async function loadHostProfile() {
    try {
        showLoading('settingsTab');
        
        // Get host profile from API
        const response = await fetch(`${API_BASE_URL}/hosts/profile`, {
            headers: {
                'Authorization': `Bearer ${getStoredToken()}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                // Host profile doesn't exist yet, we'll create one when they submit the form
                hideLoading('settingsTab');
                return;
            }
            throw new Error('Failed to load host profile');
        }
        
        hostProfile = await response.json();
        
        // Fill the form with host profile data
        document.getElementById('businessName').value = hostProfile.businessName || '';
        document.getElementById('businessAddress').value = hostProfile.businessAddress || '';
        document.getElementById('businessPhone').value = hostProfile.businessPhone || '';
        document.getElementById('hostBio').value = hostProfile.bio || '';
        
        // Show CCCD image if it exists
        if (hostProfile.cccdImageUrl) {
            document.getElementById('cccdFileName').textContent = 'Đã tải lên';
        }
        
        hideLoading('settingsTab');
    } catch (error) {
        console.error('Error loading host profile:', error);
        showToast('error', 'Không thể tải thông tin host. Vui lòng thử lại sau.');
        hideLoading('settingsTab');
    }
}

/**
 * Load categories for event form
 */
async function loadCategories() {
    try {
        // Get categories from API
        const response = await fetch(`${API_BASE_URL}/categories`);
        
        if (!response.ok) {
            throw new Error('Failed to load categories');
        }
        
        categories = await response.json();
        
        // Populate category select
        const categorySelect = document.getElementById('eventCategory');
        categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('error', 'Không thể tải danh mục. Vui lòng thử lại sau.');
    }
}

/**
 * Load host events
 */
async function loadHostEvents() {
    try {
        showLoading('eventsTab');
        
        // Get host events from API
        const response = await fetch(`${API_BASE_URL}/hosts/events`, {
            headers: {
                'Authorization': `Bearer ${getStoredToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load host events');
        }
        
        hostEvents = await response.json();
        
        // Display events
        renderHostEvents(hostEvents);
        
        // Populate event select for booking filter
        const eventSelect = document.getElementById('bookingEventFilter');
        eventSelect.innerHTML = '<option value="all">Tất cả sự kiện</option>';
        
        hostEvents.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = event.title;
            eventSelect.appendChild(option);
        });
        
        hideLoading('eventsTab');
    } catch (error) {
        console.error('Error loading host events:', error);
        showToast('error', 'Không thể tải sự kiện. Vui lòng thử lại sau.');
        hideLoading('eventsTab');
        
        // Show empty state
        document.getElementById('hostEventsList').innerHTML = '';
        document.getElementById('noEventsMessage').classList.remove('hidden');
    }
}

/**
 * Render host events
 * @param {Array} events - Array of event objects
 */
function renderHostEvents(events) {
    const eventsContainer = document.getElementById('hostEventsList');
    
    // Show empty state if no events
    if (!events || events.length === 0) {
        eventsContainer.innerHTML = '';
        document.getElementById('noEventsMessage').classList.remove('hidden');
        return;
    }
    
    // Hide empty state
    document.getElementById('noEventsMessage').classList.add('hidden');
    
    // Clear container
    eventsContainer.innerHTML = '';
    
    // Sort events by date (newest first)
    events.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    // Render each event
    events.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        
        // Determine event status
        const now = new Date();
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);
        
        let status = '';
        let statusClass = '';
        
        if (endTime < now) {
            status = 'Đã kết thúc';
            statusClass = 'status-ended';
        } else if (startTime <= now && endTime >= now) {
            status = 'Đang diễn ra';
            statusClass = 'status-active';
        } else {
            status = 'Sắp diễn ra';
            statusClass = 'status-upcoming';
        }
        
        // Count bookings for each status
        const pendingCount = event.bookings?.filter(b => b.status === 'PENDING').length || 0;
        const confirmedCount = event.bookings?.filter(b => b.status === 'CONFIRMED').length || 0;
        const cancelledCount = event.bookings?.filter(b => b.status === 'CANCELLED').length || 0;
        const attendedCount = event.bookings?.filter(b => b.status === 'ATTENDED').length || 0;
        
        eventItem.innerHTML = `
            <div class="event-item-image">
                <img src="${event.imageUrl || 'assets/default-event.png'}" alt="${event.title}">
            </div>
            <div class="event-item-content">
                <div class="event-item-header">
                    <h3>${event.title}</h3>
                    <div class="event-status ${statusClass}">${status}</div>
                </div>
                <div class="event-item-info">
                    <div class="event-info-item">
                        <i class="far fa-calendar"></i>
                        <span>${formatDate(event.startTime)}</span>
                    </div>
                    <div class="event-info-item">
                        <i class="far fa-clock"></i>
                        <span>${formatTime(event.startTime)} - ${formatTime(event.endTime)}</span>
                    </div>
                    <div class="event-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location.city}</span>
                    </div>
                    <div class="event-info-item">
                        <i class="fas fa-tag"></i>
                        <span>${formatCurrency(event.price)}</span>
                    </div>
                </div>
                <div class="event-item-stats">
                    <div class="stat-item">
                        <span class="stat-label">Đã đặt:</span>
                        <span class="stat-value">${confirmedCount + attendedCount}/${event.capacity || 'Không giới hạn'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Chờ xác nhận:</span>
                        <span class="stat-value">${pendingCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Đã tham dự:</span>
                        <span class="stat-value">${attendedCount}</span>
                    </div>
                </div>
            </div>
            <div class="event-item-actions">
                <button class="btn btn-icon btn-outline" data-event-id="${event.id}" data-action="view">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-icon btn-outline" data-event-id="${event.id}" data-action="edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-outline btn-danger" data-event-id="${event.id}" data-action="delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners for action buttons
        eventItem.querySelectorAll('.btn[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                const eventId = button.dataset.eventId;
                const action = button.dataset.action;
                
                switch (action) {
                    case 'view':
                        window.location.href = `event-detail.html?id=${eventId}`;
                        break;
                    case 'edit':
                        openEditEventModal(eventId);
                        break;
                    case 'delete':
                        confirmDeleteEvent(eventId);
                        break;
                }
            });
        });
        
        eventsContainer.appendChild(eventItem);
    });
}

/**
 * Load host bookings
 */
async function loadHostBookings() {
    try {
        showLoading('bookingsTab');
        
        // Get host bookings from API
        const response = await fetch(`${API_BASE_URL}/hosts/bookings`, {
            headers: {
                'Authorization': `Bearer ${getStoredToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load host bookings');
        }
        
        hostBookings = await response.json();
        
        // Display bookings
        renderHostBookings(hostBookings);
        
        // Update revenue data
        updateRevenueData();
        
        hideLoading('bookingsTab');
    } catch (error) {
        console.error('Error loading host bookings:', error);
        showToast('error', 'Không thể tải đặt chỗ. Vui lòng thử lại sau.');
        hideLoading('bookingsTab');
        
        // Show empty state
        document.getElementById('hostBookingsList').innerHTML = '';
        document.getElementById('noBookingsMessage').classList.remove('hidden');
    }
}

/**
 * Render host bookings
 * @param {Array} bookings - Array of booking objects
 */
function renderHostBookings(bookings) {
    const bookingsContainer = document.getElementById('hostBookingsList');
    
    // Show empty state if no bookings
    if (!bookings || bookings.length === 0) {
        bookingsContainer.innerHTML = '';
        document.getElementById('noBookingsMessage').classList.remove('hidden');
        const tableContainer = document.querySelector('.bookings-table-container');
        if (tableContainer) tableContainer.style.display = 'none';
        return;
    }
    
    // Hide empty state
    document.getElementById('noBookingsMessage').classList.add('hidden');
    const tableContainer = document.querySelector('.bookings-table-container');
    if (tableContainer) tableContainer.style.display = 'block';
    
    // Clear container
    bookingsContainer.innerHTML = '';
    
    // Sort bookings by date (newest first)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Render each booking
    bookings.forEach(booking => {
        const bookingRow = document.createElement('tr');
        
        // Get event data
        const event = booking.event || hostEvents.find(e => e.id === booking.eventId) || { title: 'Sự kiện không xác định' };
        
        // Status badge class
        let statusBadgeClass = '';
        let statusText = '';
        
        switch (booking.status) {
            case 'PENDING':
                statusBadgeClass = 'status-pending';
                statusText = 'Chờ xác nhận';
                break;
            case 'CONFIRMED':
                statusBadgeClass = 'status-confirmed';
                statusText = 'Đã xác nhận';
                break;
            case 'CANCELLED':
                statusBadgeClass = 'status-cancelled';
                statusText = 'Đã hủy';
                break;
            case 'ATTENDED':
                statusBadgeClass = 'status-attended';
                statusText = 'Đã tham dự';
                break;
        }
        
        bookingRow.innerHTML = `
            <td>${booking.user?.name || 'Khách hàng'}</td>
            <td>${event.title}</td>
            <td>${formatDate(booking.createdAt)}</td>
            <td><span class="status-badge ${statusBadgeClass}">${statusText}</span></td>
            <td>
                <button class="btn btn-sm btn-outline" data-booking-id="${booking.id}" data-action="view-booking">
                    Xem chi tiết
                </button>
            </td>
        `;
        
        // Add event listener for view booking button
        bookingRow.querySelector('.btn[data-action="view-booking"]').addEventListener('click', () => {
            openBookingModal(booking.id);
        });
        
        bookingsContainer.appendChild(bookingRow);
    });
}

/**
 * Filter host events based on status and search query
 */
function filterHostEvents() {
    const statusFilter = document.getElementById('eventStatusFilter').value;
    const searchQuery = document.getElementById('eventSearch').value.toLowerCase();
    
    // Clone the events array
    let filteredEvents = [...hostEvents];
    
    // Filter by status
    if (statusFilter !== 'all') {
        const now = new Date();
        
        filteredEvents = filteredEvents.filter(event => {
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);
            
            switch (statusFilter) {
                case 'upcoming':
                    return startTime > now;
                case 'active':
                    return startTime <= now && endTime >= now;
                case 'past':
                    return endTime < now;
                default:
                    return true;
            }
        });
    }
    
    // Filter by search query
    if (searchQuery) {
        filteredEvents = filteredEvents.filter(event => {
            return (
                event.title.toLowerCase().includes(searchQuery) ||
                event.description.toLowerCase().includes(searchQuery) ||
                event.location.city.toLowerCase().includes(searchQuery) ||
                (event.category && event.category.name.toLowerCase().includes(searchQuery))
            );
        });
    }
    
    // Render filtered events
    renderHostEvents(filteredEvents);
}

/**
 * Filter host bookings based on event and status
 */
function filterHostBookings() {
    const eventFilter = document.getElementById('bookingEventFilter').value;
    const statusFilter = document.getElementById('bookingStatusFilter').value;
    
    // Clone the bookings array
    let filteredBookings = [...hostBookings];
    
    // Filter by event
    if (eventFilter !== 'all') {
        filteredBookings = filteredBookings.filter(booking => booking.eventId === eventFilter);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
        filteredBookings = filteredBookings.filter(booking => booking.status === statusFilter);
    }
    
    // Render filtered bookings
    renderHostBookings(filteredBookings);
}

/**
 * Update revenue data
 */
function updateRevenueData() {
    // Calculate revenue from confirmed and attended bookings
    const revenueBookings = hostBookings.filter(b => 
        b.status === 'CONFIRMED' || b.status === 'ATTENDED'
    );
    
    const totalRevenue = revenueBookings.reduce((sum, booking) => {
        const event = hostEvents.find(e => e.id === booking.eventId);
        return sum + (event ? event.price : 0);
    }, 0);
    
    // Count confirmed bookings
    const confirmedBookings = hostBookings.filter(b => 
        b.status === 'CONFIRMED' || b.status === 'ATTENDED'
    ).length;
    
    // Calculate attendance rate
    const attendedBookings = hostBookings.filter(b => b.status === 'ATTENDED').length;
    const attendanceRate = confirmedBookings > 0 
        ? Math.round((attendedBookings / confirmedBookings) * 100) 
        : 0;
    
    // Update revenue overview
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('confirmedBookings').textContent = confirmedBookings;
    document.getElementById('attendanceRate').textContent = `${attendanceRate}%`;
    
    // Calculate revenue by event
    const revenueByEvent = hostEvents.map(event => {
        const eventBookings = hostBookings.filter(b => 
            b.eventId === event.id && 
            (b.status === 'CONFIRMED' || b.status === 'ATTENDED')
        );
        
        return {
            id: event.id,
            title: event.title,
            startTime: event.startTime,
            bookingCount: eventBookings.length,
            revenue: eventBookings.length * event.price
        };
    }).filter(e => e.bookingCount > 0);
    
    // Sort by revenue (highest first)
    revenueByEvent.sort((a, b) => b.revenue - a.revenue);
    
    // Render revenue by event
    const revenueTableBody = document.getElementById('eventRevenueList');
    revenueTableBody.innerHTML = '';
    
    if (revenueByEvent.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="4" class="text-center">Chưa có doanh thu nào</td>
        `;
        revenueTableBody.appendChild(emptyRow);
    } else {
        revenueByEvent.forEach(eventRevenue => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${eventRevenue.title}</td>
                <td>${formatDate(eventRevenue.startTime)}</td>
                <td>${eventRevenue.bookingCount}</td>
                <td>${formatCurrency(eventRevenue.revenue)}</td>
            `;
            revenueTableBody.appendChild(row);
        });
    }
}

/**
 * Open create event modal
 */
function openCreateEventModal() {
    // Check if host is verified
    if (hostProfile && !hostProfile.verified) {
        showToast('warning', 'Bạn cần xác thực tài khoản host trước khi tạo sự kiện');
        scrollToHostSettings();
        return;
    }
    
    // Reset form
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    document.getElementById('eventModalTitle').textContent = 'Tạo sự kiện mới';
    document.getElementById('eventImagePreview').innerHTML = '';
    
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates for datetime-local input
    const formatDateForInput = (date) => {
        return date.toISOString().slice(0, 16);
    };
    
    document.getElementById('eventStartTime').value = formatDateForInput(today);
    document.getElementById('eventEndTime').value = formatDateForInput(tomorrow);
    
    // Show modal
    document.getElementById('eventModal').classList.add('show');
}

/**
 * Open edit event modal
 * @param {string} eventId - ID of the event to edit
 */
function openEditEventModal(eventId) {
    // Find event
    const event = hostEvents.find(e => e.id === eventId);
    
    if (!event) {
        showToast('error', 'Không tìm thấy sự kiện');
        return;
    }
    
    // Reset form
    document.getElementById('eventForm').reset();
    
    // Set form title
    document.getElementById('eventModalTitle').textContent = 'Chỉnh sửa sự kiện';
    
    // Set form values
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventCategory').value = event.categoryId;
    document.getElementById('eventPrice').value = event.price;
    document.getElementById('eventCapacity').value = event.capacity || '';
    document.getElementById('eventDescription').value = event.description;
    document.getElementById('eventTags').value = event.tags.join(', ');
    document.getElementById('eventAddress').value = event.location.address;
    document.getElementById('eventCity').value = event.location.city;
    document.getElementById('eventLat').value = event.location.lat;
    document.getElementById('eventLng').value = event.location.lng;
    
    // Format dates for datetime-local input
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };
    
    document.getElementById('eventStartTime').value = formatDateForInput(event.startTime);
    document.getElementById('eventEndTime').value = formatDateForInput(event.endTime);
    
    // Show image preview if available
    const imagePreview = document.getElementById('eventImagePreview');
    imagePreview.innerHTML = '';
    
    if (event.imageUrl) {
        const img = document.createElement('img');
        img.src = event.imageUrl;
        img.alt = event.title;
        imagePreview.appendChild(img);
        
        document.getElementById('eventImageName').textContent = 'Ảnh hiện tại';
    }
    
    // Show modal
    document.getElementById('eventModal').classList.add('show');
}

/**
 * Close event modal
 */
function closeEventModal() {
    document.getElementById('eventModal').classList.remove('show');
}

/**
 * Handle event form submit
 * @param {Event} e - Form submit event
 */
async function handleEventFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const eventId = document.getElementById('eventId').value;
    
    // Parse form data
    const eventData = {
        title: formData.get('title'),
        description: formData.get('description'),
        categoryId: formData.get('categoryId'),
        price: parseFloat(formData.get('price')) || 0,
        capacity: formData.get('capacity') ? parseInt(formData.get('capacity')) : null,
        startTime: new Date(formData.get('startTime')).toISOString(),
        endTime: new Date(formData.get('endTime')).toISOString(),
        location: {
            address: formData.get('address'),
            city: formData.get('city'),
            lat: parseFloat(formData.get('lat')) || 0,
            lng: parseFloat(formData.get('lng')) || 0
        },
        tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    // Validate form data
    if (!eventData.title || !eventData.description || !eventData.categoryId) {
        showToast('error', 'Vui lòng điền đầy đủ thông tin sự kiện');
        return;
    }
    
    // Validate dates
    const startTime = new Date(eventData.startTime);
    const endTime = new Date(eventData.endTime);
    
    if (startTime >= endTime) {
        showToast('error', 'Thời gian kết thúc phải sau thời gian bắt đầu');
        return;
    }
    
    try {
        // Show loading
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        
        let response;
        
        // Handle image upload if selected
        const imageFile = document.getElementById('eventImage').files[0];
        if (imageFile) {
            const imageFormData = new FormData();
            imageFormData.append('image', imageFile);
            
            // Upload image
            const imageResponse = await fetch(`${API_BASE_URL}/uploads/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getStoredToken()}`
                },
                body: imageFormData
            });
            
            if (!imageResponse.ok) {
                throw new Error('Failed to upload image');
            }
            
            const imageData = await imageResponse.json();
            eventData.imageUrl = imageData.url;
        }
        
        // Create or update event
        if (eventId) {
            // Update existing event
            response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getStoredToken()}`
                },
                body: JSON.stringify(eventData)
            });
        } else {
            // Create new event
            response = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getStoredToken()}`
                },
                body: JSON.stringify(eventData)
            });
        }
        
        if (!response.ok) {
            throw new Error(eventId ? 'Failed to update event' : 'Failed to create event');
        }
        
        const savedEvent = await response.json();
        
        // Close modal
        closeEventModal();
        
        // Show success message
        showToast('success', eventId ? 'Sự kiện đã được cập nhật' : 'Sự kiện đã được tạo');
        
        // Reload events
        await loadHostEvents();
        
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    } catch (error) {
        console.error('Error saving event:', error);
        showToast('error', 'Không thể lưu sự kiện. Vui lòng thử lại sau.');
        
        // Reset button
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Lưu sự kiện';
    }
}

/**
 * Confirm delete event
 * @param {string} eventId - ID of the event to delete
 */
function confirmDeleteEvent(eventId) {
    if (confirm('Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.')) {
        deleteEvent(eventId);
    }
}

/**
 * Delete event
 * @param {string} eventId - ID of the event to delete
 */
async function deleteEvent(eventId) {
    try {
        // Delete event
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getStoredToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete event');
        }
        
        // Show success message
        showToast('success', 'Sự kiện đã được xóa');
        
        // Reload events
        await loadHostEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        showToast('error', 'Không thể xóa sự kiện. Vui lòng thử lại sau.');
    }
}

/**
 * Handle event image change
 */
function handleEventImageChange() {
    const fileInput = document.getElementById('eventImage');
    const fileNameDisplay = document.getElementById('eventImageName');
    const imagePreview = document.getElementById('eventImagePreview');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileNameDisplay.textContent = file.name;
        
        // Show image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Event image preview';
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else {
        fileNameDisplay.textContent = 'Chưa có file nào được chọn';
        imagePreview.innerHTML = '';
    }
}

/**
 * Handle CCCD image change
 */
function handleCCCDImageChange() {
    const fileInput = document.getElementById('cccdImage');
    const fileNameDisplay = document.getElementById('cccdFileName');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileNameDisplay.textContent = file.name;
    } else {
        fileNameDisplay.textContent = 'Chưa có file nào được chọn';
    }
}

/**
 * Handle host profile form submit
 * @param {Event} e - Form submit event
 */
async function handleHostProfileSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    
    // Parse form data
    const profileData = {
        businessName: formData.get('businessName'),
        businessAddress: formData.get('businessAddress'),
        businessPhone: formData.get('businessPhone'),
        bio: formData.get('bio')
    };
    
    try {
        // Show loading
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        
        // Handle CCCD image upload if selected
        const cccdFile = document.getElementById('cccdImage').files[0];
        if (cccdFile) {
            const imageFormData = new FormData();
            imageFormData.append('image', cccdFile);
            
            // Upload image
            const imageResponse = await fetch(`${API_BASE_URL}/uploads/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getStoredToken()}`
                },
                body: imageFormData
            });
            
            if (!imageResponse.ok) {
                throw new Error('Failed to upload CCCD image');
            }
            
            const imageData = await imageResponse.json();
            profileData.cccdImageUrl = imageData.url;
        }
        
        // Create or update host profile
        const method = hostProfile?.id ? 'PUT' : 'POST';
        const url = hostProfile?.id 
            ? `${API_BASE_URL}/hosts/${hostProfile.id}` 
            : `${API_BASE_URL}/hosts`;
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getStoredToken()}`
            },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save host profile');
        }
        
        // Update host profile
        hostProfile = await response.json();
        
        // Show success message
        showToast('success', 'Thông tin host đã được cập nhật');
        
        // Update verification banner
        updateVerificationBanner();
        
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    } catch (error) {
        console.error('Error saving host profile:', error);
        showToast('error', 'Không thể lưu thông tin host. Vui lòng thử lại sau.');
        
        // Reset button
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Cập nhật thông tin';
    }
}

/**
 * Update verification banner
 */
function updateVerificationBanner() {
    const banner = document.getElementById('verificationBanner');
    
    if (!hostProfile || !hostProfile.verified) {
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
    }
}

/**
 * Scroll to host settings tab
 */
function scrollToHostSettings() {
    // Switch to settings tab
    document.querySelector('.tab-btn[data-tab="settings"]').click();
    
    // Scroll to settings
    document.getElementById('settingsTab').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Open booking modal
 * @param {string} bookingId - ID of the booking to view
 */
function openBookingModal(bookingId) {
    // Find booking
    const booking = hostBookings.find(b => b.id === bookingId);
    
    if (!booking) {
        showToast('error', 'Không tìm thấy đặt chỗ');
        return;
    }
    
    // Find associated event
    const event = hostEvents.find(e => e.id === booking.eventId) || { title: 'Sự kiện không xác định' };
    
    // Update modal content
    const bookingDetails = document.getElementById('bookingDetails');
    
    // Status badge class
    let statusBadgeClass = '';
    let statusText = '';
    
    switch (booking.status) {
        case 'PENDING':
            statusBadgeClass = 'status-pending';
            statusText = 'Chờ xác nhận';
            break;
        case 'CONFIRMED':
            statusBadgeClass = 'status-confirmed';
            statusText = 'Đã xác nhận';
            break;
        case 'CANCELLED':
            statusBadgeClass = 'status-cancelled';
            statusText = 'Đã hủy';
            break;
        case 'ATTENDED':
            statusBadgeClass = 'status-attended';
            statusText = 'Đã tham dự';
            break;
    }
    
    bookingDetails.innerHTML = `
        <div class="booking-detail-header">
            <h3>${event.title}</h3>
            <div class="status-badge ${statusBadgeClass}">${statusText}</div>
        </div>
        <div class="booking-detail-info">
            <div class="detail-group">
                <label>Người đặt:</label>
                <p>${booking.user?.name || 'Khách hàng'}</p>
            </div>
            <div class="detail-group">
                <label>Email:</label>
                <p>${booking.user?.email || 'Không có thông tin'}</p>
            </div>
            <div class="detail-group">
                <label>Số điện thoại:</label>
                <p>${booking.user?.phone || 'Không có thông tin'}</p>
            </div>
            <div class="detail-group">
                <label>Ngày đặt:</label>
                <p>${formatDateTime(booking.createdAt)}</p>
            </div>
            <div class="detail-group">
                <label>Giá vé:</label>
                <p>${formatCurrency(event.price || 0)}</p>
            </div>
            <div class="detail-group">
                <label>Thanh toán:</label>
                <p>${booking.paymentId ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
            </div>
        </div>
    `;
    
    // Store booking ID in modal
    document.getElementById('bookingModal').dataset.bookingId = booking.id;
    
    // Show/hide buttons based on booking status
    const confirmBtn = document.getElementById('confirmBookingBtn');
    const cancelBtn = document.getElementById('cancelBookingBtn');
    const attendedBtn = document.getElementById('markAttendedBtn');
    
    confirmBtn.style.display = booking.status === 'PENDING' ? 'block' : 'none';
    cancelBtn.style.display = booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? 'block' : 'none';
    attendedBtn.style.display = booking.status === 'CONFIRMED' ? 'block' : 'none';
    
    // Show modal
    document.getElementById('bookingModal').classList.add('show');
}

/**
 * Close booking modal
 */
function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('show');
}

/**
 * Confirm booking
 */
async function confirmBooking() {
    const modal = document.getElementById('bookingModal');
    const bookingId = modal.dataset.bookingId;
    
    if (!bookingId) {
        showToast('error', 'Không tìm thấy đặt chỗ');
        return;
    }
    
    try {
        // Update booking status
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/confirm`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getStoredToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to confirm booking');
        }
        
        // Show success message
        showToast('success', 'Đặt chỗ đã được xác nhận');
        
        // Close modal
        closeBookingModal();
        
        // Reload bookings
        await loadHostBookings();
    } catch (error) {
        console.error('Error confirming booking:', error);
        showToast('error', 'Không thể xác nhận đặt chỗ. Vui lòng thử lại sau.');
    }
}

/**
 * Cancel booking
 */
async function cancelBooking() {
    const modal = document.getElementById('bookingModal');
    const bookingId = modal.dataset.bookingId;
    
    if (!bookingId) {
        showToast('error', 'Không tìm thấy đặt chỗ');
        return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn hủy đặt chỗ này?')) {
        return;
    }
    
    try {
        // Update booking status
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getStoredToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to cancel booking');
        }
        
        // Show success message
        showToast('success', 'Đặt chỗ đã được hủy');
        
        // Close modal
        closeBookingModal();
        
        // Reload bookings
        await loadHostBookings();
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showToast('error', 'Không thể hủy đặt chỗ. Vui lòng thử lại sau.');
    }
}

/**
 * Mark booking as attended
 */
async function markBookingAttended() {
    const modal = document.getElementById('bookingModal');
    const bookingId = modal.dataset.bookingId;
    
    if (!bookingId) {
        showToast('error', 'Không tìm thấy đặt chỗ');
        return;
    }
    
    try {
        // Update booking status
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/attend`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getStoredToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to mark booking as attended');
        }
        
        // Show success message
        showToast('success', 'Đặt chỗ đã được đánh dấu là đã tham dự');
        
        // Close modal
        closeBookingModal();
        
        // Reload bookings
        await loadHostBookings();
    } catch (error) {
        console.error('Error marking booking as attended:', error);
        showToast('error', 'Không thể đánh dấu đặt chỗ. Vui lòng thử lại sau.');
    }
}

/**
 * Debounce function for input handling
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Helper function to show loading indicator
 * @param {string} containerId - ID of the container to show loading in
 */
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-indicator';
    loadingEl.innerHTML = '<div class="spinner"></div>';
    loadingEl.id = `loading-${containerId}`;
    
    container.appendChild(loadingEl);
}

/**
 * Helper function to hide loading indicator
 * @param {string} containerId - ID of the container to hide loading from
 */
function hideLoading(containerId) {
    const loadingEl = document.getElementById(`loading-${containerId}`);
    if (loadingEl) {
        loadingEl.remove();
    }
}

/**
 * Calculate average rating from reviews
 * @param {Array} reviews - Array of review objects
 * @returns {number} - Average rating
 */
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
}
