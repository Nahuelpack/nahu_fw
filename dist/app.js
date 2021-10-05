//Created with ❤️ by Nahuel Perez
//https://www.linkedin.com/in/carlosnahuelperez/

//Esta funcion escucha cuando el usuario quiera volver atras.
window.onpopstate = (e) => app.state.back(e)

//La constante app sera la encargada de almacenar datos y funciones escenciales para el funcionamiento de la aplicacion web. esta es una version de prueba antes de sacarla a un CDN y volverlo libreria.
const app = {
    auth: {
        //app.auth.in() llama al autenticador para hacer el inicio. valores: default o null abrira una nueva ventana popup y 'r' para abrir en redireccion. a la llamada default se le puede agregar un .then() para hacer algo al iniciar  y un .catch() para devolver un mensaje si hay error.
        in: a => (a == 'r') ? firebase.auth().signInWithRedirect(provider) : firebase.auth().signInWithPopup(provider),

        //app.auth.out() es la funcion para cerar la sesion. se le puede agregar un .then() para hacer algo despues de que esta funcion se ejecute correctamente y un .catch() por algun error.
        out: () => firebase.auth().signOut(),

        //app.auth.current() obtiene el usuario actual, al ser una promesa el resultado debera ser tratado obligatoriamente con una funcion .then()
        current: () => new Promise((resolve) => firebase.auth().getRedirectResult().then(() => resolve(firebase.auth().currentUser)))
    },

    //Funciones de almacenamiento app.local(name, value) app.session(name, value). 'name' es el nombre que deseas para el dato almacenado y 'value' es el valor a asignar. si solo se le pone el atributo 'name' el resultado sera el dato previamente almacenado con ese nombre.
    local: (a, b) => (a) ? ((b) ? window.localStorage.setItem(a, b) : window.localStorage.getItem(a)) : {},
    session: (a, b) => (a) ? ((b) ? window.sessionStorage.setItem(a, b) : window.sessionStorage.getItem(a)) : {},


    state: {
        push: (data, title, url) => history.pushState(data, title, url),
        replace: (data, title, url) => history.replaceState(data, title, url),
        back: e => {
            if (e.state.data.id == 'page/login.htm') {
                if (!firebase.auth().currentUser) {
                    goTo(e.state.data)
                }
            } else if (e.state.data.id == 'page/start.htm') {
                app.state.volver(JSON.parse(app.session('lastState')).id);
                app.session('lastState', '');
            } else {
                app.state.volver(JSON.parse(app.session('lastState')).id);
                app.session('lastState', JSON.stringify(e.state.data))
            }

        },
        volver: x => {
            $('#' + x).addClass('closed');
            setTimeout(() => $('#' + x).remove(), 150);

        }
    },

    getFile: x => new Promise((resolve, regect) => fetch(x, { cache: 'no-cache' }).then(Response => Response.text().then(text => resolve(text))).catch(err => regect(err))),


    openPg: a => {
        app.getFile('page/' + a + '.htm')
            .then(b => {
                $('#appParent').append('<div id="' + a + '" class="pages closed">' + b + '</div>');
                setTimeout(() => $('#' + a).removeClass('closed'), 150);
                goTo({ type: 'state', id: a });
            })
            .catch(err => console.log('Intentalo otra vez 😐 ', err))
    },

    log: {},

    notif: {
        permission: (window.Notification && Notification.permission !== "denied") ? Notification.requestPermission((status) => 'Notif: ' + status) : 'Notifications denied'
    },
    notify: async (msg) => {
        if ($('#snackbar').hasClass('show')) {
            setTimeout(() => {
                app.notify(msg)
            }, 300)
        } else {
            $('#snackbar').html(msg);
            $('#snackbar').addClass('show');
            setTimeout(() => {
                $('#snackbar').removeClass('show');
                $('#snackbar').html('');
            }, 2500);
        }
    },
     input: {
        format: () => {
            const ainp = $('.ainp');
            for (let i = 0; i < ainp.length; i++) {
                var esto = ainp[i], att = esto.attributes, id = (!esto.id) ? 'ainput' + i : esto.id, attrs = '';
                for (let i = 0; i < att.length; i++) {
                    if (att[i].nodeName != 'style' && att[i].nodeName != 'type' && att[i].nodeName != 'class' && att[i].nodeName != 'placeholder') {
                        attrs += att[i].nodeName + '="' + att[i].nodeValue + '" ';
                    }
                }
                $(esto).replaceWith('<div class="ainput" style="' + att['style'].nodeValue + '"><input type="' + esto.type + '" id="' + id + '" name="' + esto.name + '" style="width:100%" ' + attrs + '><div class="placeh">' + esto.placeholder + '</div></div>');
            }
        }
    },
    standalone: () => {
        return ((window.navigator.standalone == true) || (window.matchMedia('(display-mode: standalone)').matches))
    }
}


//app.local.del('name') app.session.del('name') Con estas funciones se podra elminar completamente el dato previamente almacenado. en 'name' ira el nombre del dato que quieres eliminar :)
app.local.del = (a) => window.localStorage.removeItem(a)
app.session.del = (a) => window.sessionStorage.removeItem(a)


//esta funcion solamente es llamada por app.openPg() y app.state.back(). se encarga de decidir si la pagina se coloca por encima o remplaza todo el contenido.
const goTo = data => {
    if (data.type && data.type == 'page') {
        app.getFile(data.id).then(b => {
            $('app').hide('fade', 100, () => {
                $('app').html(b)
                // document.title = $('pagetitle').html()
                app.state.replace({ data: data }, data.id, '?' + btoa(data.id))
                $('app').show('fade', 100)
                $('.loading').hide('fade', 200);
            })
        })
    } else if (data.type && data.type == 'state') {
        app.session('lastState', JSON.stringify(data))
        app.state.push({ data: data }, data.id, '?' + btoa(data.id))
    }
}























//EMAIL SENDER LIBRARY

var Email = { send: (a) => { return new Promise((n, e) => { a.nocache = Math.floor(1e6 * Math.random() + 1), a.Action = "Send"; var t = JSON.stringify(a); Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, (e) => { n(e) }) }) }, ajaxPost: (e, n, t) => { var a = Email.createCORSRequest("POST", e); a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), a.onload = function () { var e = a.responseText; null != t && t(e) }, a.send(n) }, ajax: (e, n) => { var t = Email.createCORSRequest("GET", e); t.onload = () => { var e = t.responseText; null != n && n(e) }, t.send() }, createCORSRequest: (e, n) => { var t = new XMLHttpRequest; return "withCredentials" in t ? t.open(e, n, !0) : "undefined" != typeof XDomainRequest ? (t = new XDomainRequest).open(e, n) : t = null, t } };

//RIPPLE EFFECT LIBRARY

(function () {
    function h(c) {
        c = c.target;
        var a = c.childNodes.length;
        if ("button" !== c.localName || !a) return c.classList.contains("rippleJS") ? c : null;
        for (var b = 0; b < a; ++b) {
            var g = c.childNodes[b], e = g.classList;
            if (e && e.contains("rippleJS")) return g
        }
        return null
    }
    function n(c, a) {
        var b = h(a); if (b) {
            var g = b.classList, e = b.getAttribute("data-event");
            if (!e || e === c) {
                b.setAttribute("data-event", c);
                var d = b.getBoundingClientRect();
                e = a.offsetX; void 0 !== e ? a = a.offsetY : (e = a.clientX - d.left, a = a.clientY - d.top);
                var f = document.createElement("div");
                d = d.width === d.height ? 1.412 * d.width : Math.sqrt(d.width * d.width + d.height * d.height);
                var k = 2 * d + "px";
                f.style.width = k;
                f.style.height = k; f.style.marginLeft = -d + e + "px"; f.style.marginTop = -d + a + "px";
                f.className = "ripple";
                b.appendChild(f);
                window.setTimeout(function () { f.classList.add("held") },
                    0);
                var l = "mousedown" === c ? "mouseup" : "touchend", m = function () {
                    document.removeEventListener(l, m);
                    f.classList.add("done");
                    window.setTimeout(function () {
                        b.removeChild(f);
                        b.children.length || (g.remove("active"), b.removeAttribute("data-event"))
                    }, 650)
                };
                document.addEventListener(l, m)
            }
        }
    }
    function p() {
        var c = c || document;
        c.addEventListener("mousedown", function (a) {
            0 === a.button && n(a.type, a)
        }, { passive: !0 });
        c.addEventListener("touchstart", function (a) {
            for (var b = 0; b < a.changedTouches.length; ++b)n(a.type, a.changedTouches[b])
        }, {
            passive: !0
        })
    };

    (function () {
        function c() {
            var a = document.createElement("div");
            a.className = "rippleJS";
            document.body.appendChild(a);
            var b = "absolute" === window.getComputedStyle(a).position; document.body.removeChild(a);
            b || (a = document.createElement("style"), a.textContent = '/*rippleJS*/.rippleJS,.rippleJS.fill::after{position:absolute;top:0;left:0;right:0;bottom:0}.rippleJS{display:block;overflow:hidden;border-radius:inherit;-webkit-mask-image:-webkit-radial-gradient(circle,#fff,#000)}.rippleJS.fill::after{content:""}.rippleJS.fill{border-radius:1000000px}.rippleJS .ripple{position:absolute;border-radius:100%;background:currentColor;opacity:.2;width:0;height:0;-webkit-transition:-webkit-transform .4s ease-out,opacity .4s ease-out;transition:transform .4s ease-out,opacity .4s ease-out;-webkit-transform:scale(0);transform:scale(0);pointer-events:none;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.rippleJS .ripple.held{opacity:.4;-webkit-transform:scale(1);transform:scale(1)}.rippleJS .ripple.done{opacity:0}',
                document.head.insertBefore(a, document.head.firstChild));
            p()
        }
        "complete" === document.readyState ? c() : window.addEventListener("load", c)
    })();
}())
