async function sessionStart() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const masaNumarasi = urlParams.get('table') || "Bilinmeyen Masa";
        
        // GÖREV 1: QR URL'sinden 'pwd' parametresini al
        const qrPassword = urlParams.get('pwd') || ""; 

        localStorage.setItem("masaNo", masaNumarasi);

        const response = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                masaNo: masaNumarasi, 
                password: qrPassword, // Şifreyi backend'e iletiyoruz
                baslangicZamani: new Date(),
                durum: "aktif" 
            })
        });

        if (response.ok) {
            const data = await response.json();
            if(data.hashcode) {
                localStorage.setItem("sessionHash", data.hashcode);
            }
            window.location.replace("/");
        } else {
            const errorData = await response.json();
            alert("Oturum açılamadı: " + (errorData.error || "Lütfen QR kodu tekrar okutun."));
        }
    } catch (error) {
        console.error("Session hatası:", error);
        alert("Sunucuya bağlanılamadı.");
    }
}

window.onload = sessionStart;