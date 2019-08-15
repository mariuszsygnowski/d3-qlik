let capabilityApisPromise;

const loadCapabilityApis = async config => {
  try {
    if (capabilityApisPromise) {
      await capabilityApisPromise;
      return;
    }
    const capabilityApisJS = document.createElement('script');
    const prefix = config.prefix !== '' ? `/${config.prefix}` : '';
    capabilityApisJS.src = `${(config.secure ? 'https://' : 'http://') +
      config.host +
      (config.port ? `:${config.port}` : '') +
      prefix}/resources/assets/external/requirejs/require.js`;
    document.head.appendChild(capabilityApisJS);
    capabilityApisJS.loaded = new Promise(resolve => {
      capabilityApisJS.onload = () => {
        resolve();
      };
    });
    const capabilityApisCSS = document.createElement('link');
    capabilityApisCSS.href = `${(config.secure ? 'https://' : 'http://') +
      config.host +
      (config.port ? `:${config.port}` : '') +
      prefix}/resources/autogenerated/qlik-styles.css`;
    capabilityApisCSS.type = 'text/css';
    capabilityApisCSS.rel = 'stylesheet';
    document.head.appendChild(capabilityApisCSS);
    capabilityApisCSS.loaded = new Promise(resolve => {
      capabilityApisCSS.onload = () => {
        resolve();
      };
    });

    capabilityApisPromise = Promise.all([capabilityApisJS.loaded, capabilityApisCSS.loaded]);

    await capabilityApisPromise;
  } catch (error) {
    throw new Error(error);
  }
};

const qlikApp = async config => {
  try {
    await loadCapabilityApis(config);
    const prefix = config.prefix !== '' ? `/${config.prefix}/` : '/';
    // console.log(
    //   'base Url:',
    //   `${(config.secure ? 'https://' : 'http://') + config.host + (config.port ? `:${config.port}` : '') + prefix}resources`
    // );

    window.require.config({
      baseUrl: `${(config.secure ? 'https://' : 'http://') +
        config.host +
        (config.port ? `:${config.port}` : '') +
        prefix}resources`,
      paths: {
        'js/qlik': `${(config.secure ? 'https://' : 'http://') +
          config.host +
          (config.port ? `:${config.port}` : '') +
          prefix}resources/js/qlik`
      },
      config: {
        text: {
          useXhr() {
            console.log('useXhr');
            return true;
          },
          createXhr: function() {
            console.log('createXhr');
            const xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            return xhr;
          }
        }
      }
    });
    return new Promise(resolve => {
      console.log('window:', window);
      window.require(['js/qlik'], q => {
        const app = q.openApp(config.appId, {...config, isSecure: config.secure, prefix});
        app.model.waitForOpen.promise.then(e => {
          resolve({
            app: app,
            qlik: q
          });
        });
      });
      // window.define([], () => {
      //   return {
      //     paint: function($element, layout) {
      //       $element.html('Hi');
      //     }
      //   };
      // });
    });
  } catch (error) {
    throw new Error(error);
  }
};

export default qlikApp;
