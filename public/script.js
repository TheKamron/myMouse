 async function initSocket() {
      try {
        const res = await fetch("/__ip__");
        const ip = (await res.text()).trim();
        const origin = `http://${ip}:3000`;

        console.log("[client] connecting to socket:", origin);
        const socket = io(origin);

        const touchpad = document.getElementById("touchpad");
        let mode = null;
        let lastX = 0;
        let lastY = 0;
        let tapTimeout = null; // bitta bosish uchun

        socket.on("connect", () => console.log("[client] connected", socket.id));
        socket.on("disconnect", () => console.log("[client] disconnected"));

        // === TOUCH START ===
        touchpad.addEventListener("touchstart", (e) => {
          if (e.touches.length === 1) {
            mode = "move";
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;

            // bir barmoq bilan bosilganida left click uchun tayyor
            tapTimeout = setTimeout(() => tapTimeout = null, 200);
          } else if (e.touches.length === 2) {
            mode = "scroll";
            lastY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          }
        });

        // === TOUCH MOVE ===
        touchpad.addEventListener("touchmove", (e) => {
          e.preventDefault();
          if (mode === "move" && e.touches.length === 1) {
            const dx = e.touches[0].clientX - lastX;
            const dy = e.touches[0].clientY - lastY;
            socket.emit("move", { dx, dy });
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
          } else if (mode === "scroll" && e.touches.length === 2) {
            const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const dy = lastY - currentY;
            socket.emit("scroll", { dy });
            lastY = currentY;
          }
        }, { passive: false });

        // === TOUCH END ===
        touchpad.addEventListener("touchend", (e) => {
          if (tapTimeout && e.touches.length === 0) {
            socket.emit("click", "left"); // left click
          }
          tapTimeout = null;
          if (e.touches.length === 0) mode = null;
        });

        document.getElementById("left").addEventListener("click", () => socket.emit("click", "left"));
        document.getElementById("right").addEventListener("click", () => socket.emit("click", "right"));
      } catch (err) {
        console.error("Failed to init socket:", err);
        alert("Server bilan ulanishda xatolik. Iltimos firewall va Wi-Fi’ni tekshiring.\n\nError: " + (err && err.message));
      }
    }

    initSocket();