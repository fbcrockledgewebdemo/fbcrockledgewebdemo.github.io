(function () {
  const contentCollections = new Set(["events", "posts"]);

  CMS.registerEventListener({
    name: "preSave",
    handler: ({ entry }) => {
      const collection = entry.get("collection");
      const data = entry.get("data");

      if (collection === "site_settings") {
        const services = data.get("services");
        const gallery = data.get("gallery");

        if (services) {
          const featuredServices = services.filter((service) => service.get("featured")).count();

          if (featuredServices > 1) {
            throw new Error("Choose only one service to feature on the Services page.");
          }
        }

        if (gallery) {
          const missingDescription = gallery.some((photo) => !String(photo.get("alt") || "").trim());

          if (missingDescription) {
            throw new Error("Add an image description for every photo in the About gallery.");
          }
        }

        const image = data.get("image");
        const imageDescription = String(data.get("image_alt") || "").trim();

        if (image && !imageDescription) {
          throw new Error("Add an image description before saving the Home hero image.");
        }

        return data;
      }

      if (!contentCollections.has(collection)) {
        return data;
      }

      if (collection === "events") {
        const start = Date.parse(data.get("start"));
        const end = Date.parse(data.get("end"));

        if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
          throw new Error("The end date and time must be after the start date and time.");
        }

      }

      const image = data.get("image");
      const imageDescription = String(data.get("image_alt") || "").trim();

      if (image && !imageDescription) {
        throw new Error("Add an image description before saving a featured image.");
      }

      return data;
    },
  });
})();
