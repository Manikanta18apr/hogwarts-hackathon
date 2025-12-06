# DeshaDarsana – Firebase + Google Maps Place Discovery App

This project enables users to **search for places using Google Maps**, view place details, and **save selected places into Firebase Firestore**.  
The app then displays the saved places as a **list** and as **markers on a map**, allowing users to build their own personalized local guide.

---

## ⭐ Key Features

### **1. Google Maps Autocomplete Search**
- Users can search any place using Google's Autocomplete API.
- Real-time suggestions improve speed and accuracy.
- Selecting a place returns its **Google Place ID**.

### **2. Save Places to Firebase Firestore**
- The selected `place_id` is sent to a secure Firebase Cloud Function.
- The server calls **Google Place Details API**.
- Clean, structured place data is stored in Firestore under:


### **3. View Saved Places Inside the App**
- All saved places appear in a **list view**.
- Each place includes:
- Name  
- Address  
- Rating  
- Types  
- Photos  
- Saved places also appear as **markers on a Google Map**.

### **4. Secure Google API Handling (Cloud Functions)**
- All Google API calls happen **server-side**, keeping API keys hidden.
- Prevents misuse and client-side quota abuse.

### **5. Real-Time Sync with Firestore**
- Whenever a place is added, deleted, or updated:
- UI updates instantly for all users.
- No manual refresh required.

### **6. Expandable Architecture**
You can easily add:
- User notes for each place  
- Favorites and collections  
- Community-shared local gems  
- Travel itineraries  
- AI-based recommendations  

---

## 📌 Example Firestore Structure

```md
places/
 {placeId}/
    name: string
    address: string
    location: GeoPoint
    rating: number
    types: array
    photos: array
    website: string
    phone: string
    addedBy: userId
    addedAt: timestamp
