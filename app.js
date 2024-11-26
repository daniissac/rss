class RSSReader {
    constructor() {
        this.feeds = JSON.parse(localStorage.getItem('feeds')) || [];
        this.currentFeed = null;
        this.initializeUI();
        this.loadFeeds();
        this.loadAllFeeds(); // Load all feeds by default
    }

    initializeUI() {
        // Add Feed button
        this.addFeedBtn = document.getElementById('addFeed');
        this.modal = document.getElementById('addFeedModal');
        this.feedUrl = document.getElementById('feedUrl');
        this.cancelAddBtn = document.getElementById('cancelAdd');
        this.confirmAddBtn = document.getElementById('confirmAdd');
        this.feedsList = document.getElementById('individualFeeds');
        this.allFeedsBtn = document.getElementById('allFeeds');
        this.articlesContainer = document.getElementById('articles');

        // Event listeners
        this.addFeedBtn.addEventListener('click', () => this.showModal());
        this.cancelAddBtn.addEventListener('click', () => this.hideModal());
        this.confirmAddBtn.addEventListener('click', () => this.addFeed());
        this.allFeedsBtn.addEventListener('click', () => this.loadAllFeeds());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });
    }

    removeFeed(index, event) {
        event.stopPropagation(); // Prevent feed selection when clicking remove
        
        if (confirm('Are you sure you want to remove this feed?')) {
            this.feeds.splice(index, 1);
            localStorage.setItem('feeds', JSON.stringify(this.feeds));
            this.loadFeeds();
            
            // If we're viewing the removed feed, switch to all feeds
            if (this.currentFeed && index === this.feeds.indexOf(this.currentFeed)) {
                this.loadAllFeeds();
            } else if (this.feeds.length === 0) {
                this.loadAllFeeds();
            }
        }
    }

    showModal() {
        this.modal.classList.add('active');
        this.feedUrl.focus();
    }

    hideModal() {
        this.modal.classList.remove('active');
        this.feedUrl.value = '';
    }

    async addFeed() {
        const url = this.feedUrl.value.trim();
        if (!url) return;

        try {
            const feed = await this.fetchFeed(url);
            this.feeds.push({
                url,
                title: feed.title || url,
                description: feed.description || '',
                lastUpdated: new Date().toISOString()
            });
            
            localStorage.setItem('feeds', JSON.stringify(this.feeds));
            this.loadFeeds();
            this.hideModal();
            this.loadAllFeeds(); // Refresh all feeds view
        } catch (error) {
            alert('Error adding feed. Please check the URL and try again.');
        }
    }

    async fetchFeed(url) {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch feed');
        return await response.json();
    }

    setActiveItem(element) {
        // Remove active class from all feed items
        document.querySelectorAll('.feed-item').forEach(item => {
            item.classList.remove('active');
        });
        // Add active class to clicked item
        element.classList.add('active');
    }

    loadFeeds() {
        this.feedsList.innerHTML = '';
        this.feeds.forEach((feed, index) => {
            const feedElement = document.createElement('div');
            feedElement.className = 'feed-item';
            
            // Create feed content container
            const contentDiv = document.createElement('div');
            contentDiv.className = 'feed-content';
            contentDiv.innerHTML = `
                <div class="feed-title" title="${feed.title}">${feed.title}</div>
                <div class="feed-description">${feed.description || ''}</div>
            `;
            
            // Create remove button with a more visible symbol
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-feed';
            removeButton.textContent = '✕';  // Using a different X symbol
            removeButton.title = `Remove ${feed.title}`;
            removeButton.setAttribute('aria-label', `Remove ${feed.title}`);
            
            // Add click event for remove button
            removeButton.addEventListener('click', (e) => this.removeFeed(index, e));
            
            // Add click event for feed selection
            contentDiv.addEventListener('click', () => {
                this.setActiveItem(feedElement);
                this.loadArticles(feed);
            });
            
            // Append elements to feed item
            feedElement.appendChild(contentDiv);
            feedElement.appendChild(removeButton);
            
            this.feedsList.appendChild(feedElement);
        });

        if (this.feeds.length === 0) {
            this.feedsList.innerHTML = '<p class="empty-message">No feeds added yet. Click the + button to add a feed.</p>';
        }
    }

    async loadAllFeeds() {
        this.setActiveItem(this.allFeedsBtn);
        this.currentFeed = null;
        this.articlesContainer.innerHTML = '<div class="loading">Loading all articles...</div>';

        try {
            const allArticles = await Promise.all(
                this.feeds.map(async feed => {
                    const data = await this.fetchFeed(feed.url);
                    // Add feed title to each article
                    return {
                        ...data,
                        items: data.items.map(item => ({
                            ...item,
                            feedTitle: feed.title
                        }))
                    };
                })
            );

            const articles = allArticles
                .flatMap(feed => feed.items)
                .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

            this.displayArticles(articles);
        } catch (error) {
            this.articlesContainer.innerHTML = '<p>Error loading articles. Please try again later.</p>';
        }
    }

    async loadArticles(feed) {
        this.currentFeed = feed;
        this.articlesContainer.innerHTML = '<div class="loading">Loading articles...</div>';

        try {
            const data = await this.fetchFeed(feed.url);
            // Add feed title to each article
            const articlesWithFeed = data.items.map(item => ({
                ...item,
                feedTitle: feed.title
            }));
            this.displayArticles(articlesWithFeed);
        } catch (error) {
            this.articlesContainer.innerHTML = '<p>Error loading articles. Please try again later.</p>';
        }
    }

    displayArticles(articles) {
        this.articlesContainer.innerHTML = '';
        
        if (!articles || articles.length === 0) {
            this.articlesContainer.innerHTML = '<p>No articles found.</p>';
            return;
        }

        articles.forEach(item => {
            const articleElement = document.createElement('article');
            articleElement.className = 'article';
            articleElement.innerHTML = `
                <h2>${item.title}</h2>
                <div class="article-meta">
                    <span class="article-date">${new Date(item.pubDate).toLocaleDateString()}</span>
                    ${item.feedTitle ? `<span class="article-feed">${item.feedTitle}</span>` : ''}
                    ${item.author ? `<span class="article-author">by ${item.author}</span>` : ''}
                </div>
                <div class="article-description">${item.description}</div>
                <a href="${item.link}" target="_blank" rel="noopener noreferrer">Read more</a>
            `;
            this.articlesContainer.appendChild(articleElement);
        });
    }
}

// Initialize the app
const app = new RSSReader();
