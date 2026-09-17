import { Capacitor } from "@capacitor/core";

const isApp = Capacitor.isNativePlatform();
const CANAL = "fichas";

let plugin = null;
async function ln() {
  if (!plugin) {
    plugin = (await import("@capacitor/local-notifications")).LocalNotifications;
  }
  return { LN: plugin };
}

function chaveVistas() {
  let usuario = "anon";
  try {
    usuario = JSON.parse(localStorage.getItem("user") || "{}").username || "anon";
  } catch {
  }
  return `notif-android-vistas:${usuario}`;
}

export async function estadoPermissao() {
  if (!isApp) return "indisponivel";
  const { display } = await (await ln()).LN.checkPermissions();
  return display;
}

export async function pedirPermissao() {
  if (!isApp) return false;
  const { LN } = await ln();
  const { display } = await LN.requestPermissions();
  if (display === "granted") await criarCanal();
  return display === "granted";
}

async function criarCanal() {
  try {
    await (await ln()).LN.createChannel({
      id: CANAL,
      name: "Fichas",
      description: "Aprovações, reprovações e avisos das fichas",
      importance: 4,
      visibility: 1,
      vibration: true,
    });
  } catch {
  }
}

export async function avisarNovas(lista) {
  if (!isApp || !Array.isArray(lista)) return;

  const chave = chaveVistas();
  let vistas;
  let primeira = false;
  try {
    const salvo = localStorage.getItem(chave);
    primeira = salvo === null;
    vistas = new Set(JSON.parse(salvo || "[]"));
  } catch {
    vistas = new Set();
  }

  const novas = lista.filter((n) => n && !vistas.has(n.id));
  if (!novas.length && !primeira) return;
  novas.forEach((n) => vistas.add(n.id));
  try {
    localStorage.setItem(chave, JSON.stringify([...vistas].slice(-500)));
  } catch {
  }
  if (primeira) return;

  const avisar = novas.filter((n) => !n.lida).slice(0, 5);
  if (!avisar.length || (await estadoPermissao()) !== "granted") return;

  await (await ln()).LN.schedule({
    notifications: avisar.map((n) => ({
      id: (Number(n.id) || Date.now()) % 2147483647,
      title: n.titulo || "Fichas IndusPower",
      body: n.mensagem || "",
      channelId: CANAL,
      smallIcon: "ic_stat_notify",
      iconColor: "#1a4b50",
      extra: { link: n.link || null, id: n.id },
    })),
  });
}

export async function aoTocarNotificacao(callback) {
  if (!isApp) return () => {};
  const h = await (await ln()).LN.addListener(
    "localNotificationActionPerformed",
    ({ notification }) => callback(notification?.extra || {}),
  );
  return () => h.remove();
}
