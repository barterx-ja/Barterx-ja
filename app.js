const api = https://barterx-ja.onrender.com
const appDiv = document.getElementById('app');

let userId = null;

function showLogin() {
  appDiv.innerHTML = `
    <h2>Login</h2>
    <input id="email" placeholder="Email">
    <input id="password" type="password" placeholder="Password">
    <button id="loginBtn">Login</button>
    <button id="signupBtn">Sign Up</button>
  `;
  document.getElementById('loginBtn').onclick = login;
  document.getElementById('signupBtn').onclick = signup;
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${api}/login`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if(data.userId){ userId = data.userId; showDashboard(); }
  else alert(data.error);
}

async function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${api}/signup`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if(data.userId){ userId = data.userId; showDashboard(); }
  else alert(data.error);
}

async function showDashboard() {
  appDiv.innerHTML = `
    <h2>Dashboard</h2>
    <h3>Create Listing</h3>
    <input id="title" placeholder="Title">
    <textarea id="description" placeholder="Description"></textarea>
    <input id="value" placeholder="Value">
    <button id="createListingBtn">Create Listing</button>
    <h3>All Listings</h3>
    <div id="listings"></div>
  `;
  document.getElementById('createListingBtn').onclick = createListing;
  loadListings();
}

async function createListing() {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const value = document.getElementById('value').value;
  await fetch(`${api}/listings`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ user_id: userId, title, description, value })
  });
  loadListings();
}

async function loadListings() {
  const res = await fetch(`${api}/listings`);
  const listings = await res.json();
  const listingsDiv = document.getElementById('listings');
  listingsDiv.innerHTML = '';
  listings.forEach(l => {
    const div = document.createElement('div');
    div.className = 'listing';
    div.innerHTML = `<strong>${l.title}</strong> (${l.value})<br>${l.description}<br>`;
    if(l.user_id !== userId){
      const btn = document.createElement('button');
      btn.textContent = 'Propose Trade';
      btn.onclick = () => proposeTrade(l.id);
      div.appendChild(btn);
    }
    listingsDiv.appendChild(div);
  });
}

async function proposeTrade(to_listing) {
  const from_listing = prompt('Enter your listing ID to offer:');
  await fetch(`${api}/trades`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ from_listing, to_listing })
  });
  alert('Trade proposed!');
}

showLogin();
