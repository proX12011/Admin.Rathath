document.addEventListener("DOMContentLoaded", () => {
  const dbRef = firebase.firestore();

  const nameInput = document.getElementById("pName");
  const descInput = document.getElementById("pDesc");
  const priceInput = document.getElementById("pPrice");
  const discountInput = document.getElementById("pDiscount");
  const categorySelect = document.getElementById("pCategory");
  const imageUrlInput = document.getElementById("pImageUrl");
  const addBtn = document.getElementById("addProductBtn");
  const addMsg = document.getElementById("addMsg");

  const waInput = document.getElementById("waNumber");
  const logoInput = document.getElementById("logoUrl");
  const saveSettingsBtn = document.getElementById("saveSettings");
  const settingsMsg = document.getElementById("settingsMsg");

  const productsList = document.getElementById("productsList");
  const adminLogo = document.getElementById("admin-logo");

  addBtn.addEventListener("click", async () => {
    const data = {
      name: nameInput.value.trim(),
      description: descInput.value.trim(),
      price: parseFloat(priceInput.value) || 0,
      discountPercent: parseFloat(discountInput.value) || 0,
      category: categorySelect.value,
      image: imageUrlInput.value.trim()
    };

    if (!data.name || !data.price) {
      addMsg.textContent = "الاسم والسعر مطلوبان!";
      return;
    }

    try {
      await dbRef.collection("products_" + data.category).add(data);
      addMsg.textContent = "تمت إضافة المنتج بنجاح!";
      nameInput.value = descInput.value = priceInput.value = discountInput.value = imageUrlInput.value = "";
    } catch (e) {
      console.error(e);
      addMsg.textContent = "فشل إضافة المنتج!";
    }
  });

  const sections = ["men","women","offers"];
  sections.forEach(sec => {
    dbRef.collection("products_" + sec).onSnapshot(() => {
      renderProducts();
    });
  });

  function renderProducts() {
    productsList.innerHTML = "";
    sections.forEach(sec => {
      dbRef.collection("products_" + sec).get().then(snapshot => {
        snapshot.forEach(doc => {
          const p = doc.data();
          const item = document.createElement("div");
          item.className = "product-item";

          item.innerHTML = `
            <img src="${p.image}" />
            <div class="product-info">
              <strong>${p.name}</strong><br>
              <small>${p.description}</small><br>
              السعر: ${p.price} ج
              ${p.discountPercent > 0 ? `<br>خصم: ${p.discountPercent}%` : ""}
              <br>القسم: ${sec}
            </div>
            <div class="product-actions">
              <button class="action-edit" data-id="${doc.id}" data-sec="${sec}">تعديل</button>
              <button class="action-delete" data-id="${doc.id}" data-sec="${sec}">حذف</button>
            </div>
          `;

          productsList.appendChild(item);
        });
        attachProductActions();
      });
    });
  }

  function attachProductActions() {
    document.querySelectorAll(".action-delete").forEach(btn=>{
      btn.onclick = async () => {
        const sec = btn.dataset.sec;
        const id = btn.dataset.id;
        if(confirm("هل تريد حذف هذا المنتج؟")){
          await dbRef.collection("products_" + sec).doc(id).delete();
        }
      };
    });

    document.querySelectorAll(".action-edit").forEach(btn=>{
      btn.onclick = async () => {
        const sec = btn.dataset.sec;
        const id = btn.dataset.id;
        const docRef = dbRef.collection("products_" + sec).doc(id);
        const docSnap = await docRef.get();
        if(!docSnap.exists) return;

        const data = docSnap.data();

        const newName = prompt("الاسم:", data.name);
        if(newName === null) return;

        const newDesc = prompt("الوصف:", data.description);
        if(newDesc === null) return;

        const newPrice = parseFloat(prompt("السعر:", data.price));
        if(isNaN(newPrice)) return;

        const newDiscount = parseFloat(prompt("نسبة الخصم:", data.discountPercent));
        if(isNaN(newDiscount)) return;

        const newImage = prompt("رابط الصورة:", data.image);
        if(newImage === null) return;

        await docRef.update({
          name: newName,
          description: newDesc,
          price: newPrice,
          discountPercent: newDiscount,
          image: newImage
        });
      };
    });
  }

  dbRef.collection("settings").doc("main").get().then(doc=>{
    if(doc.exists){
      const d = doc.data();
      if(d.logo) adminLogo.src = d.logo;
      if(d.whatsapp) waInput.value = d.whatsapp;
      if(d.logo) logoInput.value = d.logo;
    }
  });

  saveSettingsBtn.onclick = async ()=>{
    try{
      await dbRef.collection("settings").doc("main").set({
        whatsapp: waInput.value.trim(),
        logo: logoInput.value.trim()
      });
      settingsMsg.textContent = "تم حفظ الإعدادات!";
      adminLogo.src = logoInput.value.trim();
    }catch(e){
      console.error(e);
      settingsMsg.textContent = "فشل حفظ الإعدادات!";
    }
  };

  renderProducts();
});
