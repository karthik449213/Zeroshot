
        // Theme Management (using in-memory storage for demo)
        let currentTheme = 'light';
        
        function toggleTheme() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', currentTheme);
            
            const themeToggle = document.querySelector('.theme-toggle');
            themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
            
            // In a real deployment, this would use localStorage:
            // localStorage.setItem('theme', currentTheme);
        }

        // Initialize theme (in real deployment, this would check localStorage)
        function initTheme() {
            // const savedTheme = localStorage.getItem('theme') || 'light';
            const savedTheme = 'light'; // Default for demo
            currentTheme = savedTheme;
            document.documentElement.setAttribute('data-theme', currentTheme);
            
            const themeToggle = document.querySelector('.theme-toggle');
            themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
        }

        // Removed Firebase/samplePosts for production use

        // Page Management
        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.remove('active');
            });
            // Show selected page
            const section = document.getElementById(pageId);
            if (section) section.classList.add('active');
            // Handle admin authentication
            if (pageId === 'admin') {
                authenticateAdmin();
            }
        }

        // Admin Authentication
        function authenticateAdmin() {
            const password = prompt('Enter admin password:');
            if (password !== 'admin123') {
                alert('Invalid password!');
                showPage('home');
                return;
            }
        }

        // Load Blog Posts from backend
        async function loadBlogPosts() {
            const blogGrid = document.getElementById('blogGrid');
            blogGrid.innerHTML = '';
            try {
            const apiUrl = (window.location.hostname === 'localhost')
                ? 'http://localhost:5000/api/posts'
                : '/api/posts';
            const res = await fetch(apiUrl);
            const posts = await res.json();
            posts.forEach(post => {
                const blogCard = createBlogCard(post);
                blogGrid.appendChild(blogCard);
            });
            } catch (err) {
                blogGrid.innerHTML = '<p style="color:red">Failed to load posts.</p>';
            }
        }

        // Create Blog Card
        function createBlogCard(post) {
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.onclick = () => showBlogPost(post);
            card.innerHTML = `
                <img src="${post.image}" alt="${post.title}" class="lazy-image" loading="lazy">
                <div class="blog-card-content">
                    <h3>${post.title}</h3>
                    <div class="blog-card-meta">
                        ${formatDate(post.date)} • <span class="author">By ${post.author}</span>
                    </div>
                    <p>${post.description}</p>
                </div>
            `;
            return card;
        }

        // Show Blog Post
        function showBlogPost(post) {
            const postContent = document.getElementById('blogPostContent');
            postContent.innerHTML = `
                <img src="${post.image}" alt="${post.title}">
                <div class="blog-post-content">
                    <h1>${post.title}</h1>
                    <div class="blog-post-meta">
                        ${formatDate(post.date)} • <span class="author">By ${post.author}</span>
                    </div>
                    <div class="blog-post-text">
                        ${post.content}
                    </div>
                </div>
            `;
            showPage('blogPost');
        }

        // Format Date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Admin Form Submission (send to backend)
        document.getElementById('adminForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const postData = {
                title: formData.get('title'),
                description: formData.get('description'),
                content: formData.get('content'),
                date: new Date().toISOString().split('T')[0],
                author: 'Admin',
                image: 'https://via.placeholder.com/500x300/667eea/ffffff?text=New+Post'
            };
            const imageFile = formData.get('image');
            // (Optional) handle image upload to backend if needed
            try {
                const apiUrl = (window.location.hostname === 'localhost')
                    ? 'http://localhost:5000/api/posts'
                    : '/api/posts';
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(postData)
                });
                if (!res.ok) throw new Error('Failed to publish post');
                showToast('Post published successfully!');
                e.target.reset();
                loadBlogPosts();
            } catch (err) {
                showToast('Error publishing post.');
            }
        });

        // Show Toast
        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Lazy Loading Images
        function setupLazyLoading() {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('.lazy-image').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Initialize App
        function initApp() {
            initTheme();
            loadBlogPosts();
            setupLazyLoading();
            
            // Update last updated date
            document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString();
            
            // Hide preloader
            setTimeout(() => {
                document.getElementById('preloader').classList.add('hidden');
            }, 1000);
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', initApp);
