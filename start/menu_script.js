let menu = []; // GLOBAL TANIM

function menuyuGoster() {
  fetch("/api/menu")
    .then(res => res.json())
    .then(data => {
      menu = data;
      rendermenu();
    });
}

function rendermenu(){
  const menuList = document.getElementById("menu-list");
  menuList.innerHTML = ""; // Önceki ekranı temizler

  menu.forEach(item => {
    let div = document.createElement("div");
    div.className = "menu-item";

    div.style = "margin: 15px auto; padding: 10px; border: 1px solid #ccc; border-radius: 8px; width: 80%; max-width: 400px;";

    div.innerHTML = `
       <span style="font-weight: bold;">${item.isim} - ${item.fiyat} TL</span>
       <br><br>
       <button onclick="addToCart(${item.id})" style="padding: 5px 15px; cursor: pointer;">Ekle (+)</button>
       <button onclick="removeFromCart(${item.id})" style="padding: 5px 15px; cursor: pointer;">Çıkar (-)</button>
    `;

    menuList.appendChild(div);
   });
}