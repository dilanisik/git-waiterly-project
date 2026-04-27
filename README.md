# PROJECT - WAITERLY (Smart Digital Waiter System)

##Live URL !!!!!!
https://waiterly-latest.onrender.com

##Live URL for Admin Panel
https://waiterly-latest.onrender.com/admin

## DESCRIPTION
Waiterly is a Smart Digital Waiter System designed to address the issue of traditional menus being organized around products rather than customer moods or requests  and most importantly the issue that usual QR menus are nothing different than the paper ones. It is an innovative digital ordering website for cafés, bars, and restaurants that provides a personalized ordering experience. The system aims to speed up the ordering process, reduce waiting times, and improve overall customer satisfaction while helping businesses operate more efficiently and cost-effectively.Unlike conventional menus that are strictly product-based and static—even in QR form—Waiterly introduces a dynamic, user-centered approach

# SCENARIO
When a customer arrives at a new restaurant and has no idea what to order, they often feel overwhelmed by long, product-based menus that offer little guidance. Instead of enjoying the experience, they spend time scrolling through endless options, trying to guess what might suit their taste, mood, or dietary preferences.

With Waiterly, this experience is transformed into something intuitive and enjoyable. Rather than forcing the customer to adapt to the menu, the menu adapts to the customer. By simply selecting their mood (e.g., “I want something light,” “I feel like trying something new,” or “I need comfort food”) or specifying preferred ingredients, the system instantly generates personalized recommendations.

At the same time, customers can clearly see allergen information, customize their meals, and place orders directly without waiting for staff. Behind the scenes, every action is instantly communicated to the kitchen and staff, ensuring a seamless and efficient dining experience.

As a result, even first-time visitors can confidently make choices, discover new favorites, and enjoy a faster and more comfortable restaurant experience.

## TECH STACK
* **Frontend:** React and HTML
* **Backend:** Node.js(Express.js)
* **Database:** MongoDB

## KEY FEATURES
* **QR Code Menu Access & Table Session:** Customers can scan a QR code to access the digital menu, start a secure ordering session, and view their total bill.
* **Mood-Based Recommendations:** The system suggests drinks or meals according to the user's current mood, turning a simple task into an enjoyable experience.
* **Ingredient Selection & Custom Creations:** Users can choose specific ingredients they want, allowing them to create personalized cocktails or meals.
* **Allergen & Ingredient Visibility:** Provides clear allergen details for each item to help customers with allergies order safely while helping customers to see the ingredients of their order.
* **Order Notification System:** Sends real-time order notifications to staff for every table, ensuring fast and efficient service.
* **Admin Panel (Menu Management):** Allows business owners or staff to easily update menu items, prices, and availability through a centralized system.
* **Product Rating & Popular Items:** Users can rate consumed products, contributing to a "most liked" section to help future customers discover popular items.

## SYSTEM ARCHITECTURE & DESIGN
* **Layered Architecture:** The application is separated into a Presentation Layer (UI), Application Layer (business logic like orders and recommendations), and Data Layer (databases) to ensure modularity, scalability, and easy maintenance.
* **Strategy Pattern:** Implemented in the recommendation system to dynamically switch between two algorithms: mood-based filtering and ingredient-based filtering.
* **Observer Pattern:** Implemented in the order notification system to provide real-time updates across multiple components, instantly notifying waiter panels and kitchen screens when a new order is placed.

## GOALS & IMPACT
* Speed up the ordering process and reduce customer waiting times.
* Optimize staff workload and help business owners handle rush hours without needing to hire additional staff.
* Create an engaging, interactive, and mood-centered menu experience.
* Allow customers to easily request additional service (like calling the waiter) directly through the website without leaving their table.

## TEAM MEMBERS (Team Server)
* Bora Çetin
* Emre Dağlı
* Dilan Işık
* Ahmet Burak Namal
