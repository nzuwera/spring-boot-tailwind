function testNotification() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("PWA Notification from Spring Boot 🚀");
            }
        });
    } else {
        new Notification("PWA Notification from Spring Boot 🚀");
    }
}
