const { app, BrowserWindow, Menu, net, shell, nativeTheme  } = require('electron');
const path = require('path');

let win;
let isOnline = false; // Estado da conexão

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    useContentSize: true,
    // titleBarStyle: "customButtonsOnHover"
  });

  win.setContentSize(760, 560);
  win.maximize(); //maximiza app


  // Verifica a conexão inicial
  checkInternetConnection().then((online) => {
    isOnline = online; // Atualiza o estado inicial
    loadPage(win, online); // Carrega a página inicial com base na conexão
  });

  // Monitora a conexão a cada segundo
  setInterval(async () => {
    const online = await checkInternetConnection();
    if (online !== isOnline) { // Apenas muda a página se o estado mudou
      isOnline = online;
      loadPage(win, isOnline);
    }
  }, 1000); // Verifica a cada 1 segundo

  const menuTemplate = [
    {
      label: 'Visualização',
      submenu: [
        { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', click: () => win.reload() },
        { type: 'separator' },
        { label: 'Zoom original', accelerator: 'CmdOrCtrl+0', click: () => win.webContents.setZoomLevel(0) },
        { label: 'Zoom +', accelerator: 'CmdOrCtrl+=', click: () => {
            win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 1);
          } 
        },
        { label: 'Zoom -', accelerator: 'CmdOrCtrl+-', click: () => win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 1) },
        { type: 'separator' },
        { label: 'Tela Cheia', accelerator: 'F11', click: () => {
            const isFullScreen = win.isFullScreen();
            win.setFullScreen(!isFullScreen);
        }},
      ],
    },
    {
      label: 'Janela',
      submenu: [
        { label: 'Minimizar', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Maximizar', accelerator: 'CmdOrCtrl+Shift+M', click: () => win.maximize() },
      ],
    },
    {
      label: 'Ajuda',
      submenu: [
        { 
          label: 'Comunidade no Discord', 
          click: () => { 
            shell.openExternal('https://discord.gg/rxd8gmGB'); 
          } 
        },
        { 
          label: 'Site', 
          click: () => { 
            shell.openExternal('https://readbooks.site'); 
          } 
        },
      ]
    },
  ];



  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

function loadPage(win, online) {
  if (online) {
    win.loadURL('https://readbooks.site').catch(err => {
      console.error('Erro ao carregar a página:', err);
        win.webContents.executeJavaScript(`
          alert('Erro 404: Atualize o aplicativo para a versão mais recente.');
        `);
    });
  } else {
    win.loadFile(path.join(__dirname, 'offline.html'));
  }
}




// verifica po sistema se é dark ou não
function loadingDarkTheme(){
  win.webContents.on('did-finish-load', () => {
    const isDark = nativeTheme.shouldUseDarkColors;
    const js = isDark ? "localStorage.setItem('darkMode', 'enabled')" : "localStorage.removeItem('darkMode')"
    win.webContents.executeJavaScript(js);
    win.webContents.executeJavaScript(`verificarModoNoturno()`);
  });

  nativeTheme.on('updated', () => {
    const isDark = nativeTheme.shouldUseDarkColors;
    const js = isDark ? "localStorage.setItem('darkMode', 'enabled')" : "localStorage.removeItem('darkMode')"
    win.webContents.executeJavaScript(js);
    win.webContents.executeJavaScript(`verificarModoNoturno()`);
  });
}

async function checkInternetConnection() {
  return new Promise((resolve) => {
    const request = net.request('https://www.google.com');
    request.on('response', () => resolve(true));
    request.on('error', () => resolve(false));
    request.end();
  });
}

app.on('ready', createWindow);
