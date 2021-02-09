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
            alert(e.state.data.id)
            if (e.state.data.id == 'page/login.htm') {
                if (!firebase.auth().currentUser) {
                    goTo(e.state.data)
                }
            } else if (e.state.data.id == 'page/start.htm') {
                app.state.volver(JSON.parse(app.session('lastState')).id);
                app.session('lastState', '');
            } else {
                alert('else')
                app.state.volver(JSON.parse(app.session('lastState')).id);
                app.session('lastState', JSON.stringify(e.state.data))
            }

        },
        volver: x => {
            if (x == 'userinfo') {
                if ($('.chip').hasClass('card')) {
                    $('.chip').removeClass('card');
                    $('.chip').on('click', thisUserInf);
                }
            } else {
                $('#' + x).addClass('closed');
                setTimeout(() => $('#' + x).remove(), 150);
            }

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

