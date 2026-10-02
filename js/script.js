console.log("Portfolio JavaScript loaded.");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.querySelector("#primary-nav");

document.body.classList.add("js-motion");

if (navToggle && primaryNav) {
  const setNavOpen = (isOpen) => {
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    primaryNav.classList.toggle("is-open", isOpen);
  };

  navToggle.addEventListener("click", () => {
    setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setNavOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && primaryNav.classList.contains("is-open")) {
      setNavOpen(false);
      navToggle.focus();
    }
  });
}

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const sectionLinks = document.querySelectorAll(".nav-link[href^='#']");
const observedSections = [...sectionLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("is-active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });

  observedSections.forEach((section) => sectionObserver.observe(section));
}

if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
      const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${vertical * -3}deg) rotateY(${horizontal * 3}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const bounds = button.getBoundingClientRect();
      const offsetX = (event.clientX - bounds.left - bounds.width / 2) * 0.06;
      const offsetY = (event.clientY - bounds.top - bounds.height / 2) * 0.08;
      button.style.translate = `${offsetX}px ${offsetY}px`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.translate = "";
    });
  });
}

const neuralCanvas = document.querySelector("#neural-canvas");
const neuralStage = document.querySelector(".hero-visual");
const smallScreen = window.matchMedia("(max-width: 600px)").matches;

if (neuralCanvas && neuralStage && window.THREE && !smallScreen) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 6.3;

    const renderer = new THREE.WebGLRenderer({
      canvas: neuralCanvas,
      alpha: true,
      antialias: !smallScreen,
      powerPreference: "low-power"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    const network = new THREE.Group();
    scene.add(network);

    const nodeCount = 44;
    const nodePositions = [];
    const connectionPositions = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex += 1) {
      const vertical = 1 - (nodeIndex / (nodeCount - 1)) * 2;
      const ringRadius = Math.sqrt(1 - vertical * vertical);
      const angle = goldenAngle * nodeIndex;
      const radius = 1.55 + 0.18 * Math.sin(nodeIndex * 2.1);
      nodePositions.push(
        Math.cos(angle) * ringRadius * radius,
        vertical * radius,
        Math.sin(angle) * ringRadius * radius
      );
    }

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(nodePositions, 3));
    const pointMaterial = new THREE.PointsMaterial({
      color: 0xc2ef73,
      size: 0.055,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true
    });
    network.add(new THREE.Points(pointGeometry, pointMaterial));

    const nodeVectors = [];
    for (let nodeIndex = 0; nodeIndex < nodePositions.length; nodeIndex += 3) {
      nodeVectors.push(new THREE.Vector3(
        nodePositions[nodeIndex],
        nodePositions[nodeIndex + 1],
        nodePositions[nodeIndex + 2]
      ));
    }

    for (let firstIndex = 0; firstIndex < nodeVectors.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < nodeVectors.length; secondIndex += 1) {
        if (nodeVectors[firstIndex].distanceTo(nodeVectors[secondIndex]) < 0.83 && connectionPositions.length < 1250) {
          connectionPositions.push(
            ...nodeVectors[firstIndex].toArray(),
            ...nodeVectors[secondIndex].toArray()
          );
        }
      }
    }

    const connectionGeometry = new THREE.BufferGeometry();
    connectionGeometry.setAttribute("position", new THREE.Float32BufferAttribute(connectionPositions, 3));
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x85a99a,
      transparent: true,
      opacity: 0.3
    });
    network.add(new THREE.LineSegments(connectionGeometry, connectionMaterial));

    const particlePositions = [];
    for (let particleIndex = 0; particleIndex < 72; particleIndex += 1) {
      const vertical = 1 - 2 * (particleIndex + 0.5) / 72;
      const ringRadius = Math.sqrt(1 - vertical * vertical);
      const angle = goldenAngle * particleIndex * 1.7;
      const radius = 2.05 + (particleIndex % 7) * 0.035;
      particlePositions.push(
        Math.cos(angle) * ringRadius * radius,
        vertical * radius,
        Math.sin(angle) * ringRadius * radius
      );
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3));
    network.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({
      color: 0x85c8b0,
      size: 0.018,
      transparent: true,
      opacity: 0.58
    })));

    const rings = [
      { radius: 2.45, rotation: [0.8, 0.1, 0.25], color: 0x6f9e7c },
      { radius: 2.18, rotation: [1.2, 0.5, -0.3], color: 0x6597a0 }
    ];
    rings.forEach((ring) => {
      const geometry = new THREE.TorusGeometry(ring.radius, 0.0025, 4, 120);
      const material = new THREE.MeshBasicMaterial({ color: ring.color, transparent: true, opacity: 0.28 });
      const orbit = new THREE.Mesh(geometry, material);
      orbit.rotation.set(...ring.rotation);
      network.add(orbit);
    });

    const resizeRenderer = () => {
      const bounds = neuralStage.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      camera.aspect = bounds.width / bounds.height;
      camera.updateProjectionMatrix();
      renderer.setSize(bounds.width, bounds.height, false);
      if (reducedMotion) renderer.render(scene, camera);
    };

    let pointerX = 0;
    let pointerY = 0;
    let isStageVisible = false;
    let animationFrame = 0;
    let animationStart = 0;

    const renderNetwork = (time) => {
      if (!isStageVisible || document.hidden) {
        animationFrame = 0;
        return;
      }
      if (!animationStart) animationStart = time;
      const elapsed = (time - animationStart) * 0.00016;
      network.rotation.y = elapsed + pointerX * 0.11;
      network.rotation.x = Math.sin(elapsed * 0.8) * 0.06 + pointerY * 0.07;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(renderNetwork);
    };

    const updateAnimation = () => {
      if (reducedMotion) {
        renderer.render(scene, camera);
        return;
      }
      if (isStageVisible && !document.hidden && !animationFrame) {
        animationFrame = window.requestAnimationFrame(renderNetwork);
      } else if ((!isStageVisible || document.hidden) && animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    neuralStage.addEventListener("pointermove", (event) => {
      const bounds = neuralStage.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
      pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    });
    neuralStage.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
    });
    window.addEventListener("resize", resizeRenderer, { passive: true });
    document.addEventListener("visibilitychange", updateAnimation);

    if ("IntersectionObserver" in window && !reducedMotion) {
      const stageObserver = new IntersectionObserver((entries) => {
        isStageVisible = entries.some((entry) => entry.isIntersecting);
        updateAnimation();
      }, { threshold: 0.08 });
      stageObserver.observe(neuralStage);
    } else {
      isStageVisible = true;
    }

    resizeRenderer();
    updateAnimation();
    document.body.classList.add("three-ready");
  } catch (error) {
    console.warn("Neural visualization could not be initialized.", error);
  }
}

const projectImages = document.querySelectorAll(".project-image");

projectImages.forEach((image) => {
  const markImageLoaded = () => {
    image.classList.add("is-loaded");
    image.closest(".project-visual")?.classList.add("image-loaded");
  };

  if (image.complete && image.naturalWidth > 0) {
    markImageLoaded();
  } else {
    image.addEventListener("load", markImageLoaded, { once: true });
    image.addEventListener("error", () => {
      image.hidden = true;
    }, { once: true });
  }
});
