// Load listings
function loadListings() {
  fetch('/listings')
    .then(res => res.json())
    .then(listings => {
      const container = document.getElementById('listingContainer');
      container.innerHTML = '';
      listings.forEach(l => {
        const div = document.createElement('div');
        div.className = 'listing';
        div.innerHTML = `<strong>${l.title}</strong><p>${l.description}</p><em>${l.owner}</em>`;
        container.appendChild(div);
      });
    });
}

// Load trades
function loadTrades() {
  fetch('/trades') // Optional: create endpoint to get trades
    .then(res => res.json())
    .then(trades => {
      const container = document.getElementById('tradeContainer');
      container.innerHTML = '';
      trades.forEach(t => {
        const div = document.createElement('div');
        div.className = 'trade ' + t.status;
        div.innerHTML = `<p>From Listing ID: ${t.from_listing}, To Listing ID: ${t.to_listing}</p>
          <p>Status: ${t.status}</p>`;
        container.appendChild(div);
      });
    }).catch(()=>{});
}

// Add new listing
document.getElementById('listingForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const owner = document.getElementById('owner').value;
  fetch('/listings', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ title, description, owner })
  }).then(res => res.json())
    .then(()=> { 
      loadListings(); 
      loadMarketplace(owner);
      document.getElementById('listingForm').reset(); 
    });
});

// Load marketplace listings
function loadMarketplace(ownerName) {
  fetch('/marketplace/' + encodeURIComponent(ownerName))
    .then(res => res.json())
    .then(listings => {
      const container = document.getElementById('marketplaceContainer');
      container.innerHTML = '';
      listings.forEach(l => {
        const div = document.createElement('div');
        div.className = 'listing';
        div.innerHTML = `<strong>${l.title}</strong>
                         <p>${l.description}</p>
                         <em>${l.owner}</em>
                         <button onclick="proposeTradePrompt(${l.id})">Propose Trade</button>`;
        container.appendChild(div);
      });
    });
}

// Propose trade prompt
function proposeTradePrompt(toListingId) {
  const fromListingId = prompt('Enter your Listing ID to trade:');
  if (!fromListingId) return;
  fetch('/trades', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ from_listing: fromListingId, to_listing: toListingId })
  })
  .then(res => res.json())
  .then(data => {
    alert('Trade proposal sent! Trade ID: ' + data.tradeId);
    loadTrades();
  });
}

// Initialize
const currentOwner = document.getElementById('owner')?.value || 'YourName';
loadListings();
loadTrades();
loadMarketplace(currentOwner);

 
