// Select3.prototype.select3 = function(options) {
//
//     const _ = this;
//     const configs = options;
//
//     const optGroups = _.querySelectorAll('optgroup');
//     const opts = _.querySelectorAll('option');
//
//     console.log(optGroups);
//     console.log(opts);
// }
// const select = d.getElementById('select3');

// document.addEventListener('click', e => {
//     console.log(e.target);
// })

const d = document;

function _(selector) {
    return d.querySelectorAll(selector)
}

function Select3(selector, options) {

    // If any options were set, apply them
    options = applyOptions()

    const elements = _(selector)

    const newSelects = []

    for (let el of elements) {

        if (el.tagName !== 'SELECT') continue

        // TODO --> Get all selected options from OG <select>
        // TODO --> Escape the text in <option>
        // TODO --> Have "allowNoSelection" option for if you want to deselect or select nothing
        // TODO --> Close select when clicking outside of it
        // TODO --> Implement search
        // TODO --> Consider implementing ajax or something
        // TODO --> Get all values of a multiple select when sending ajax
        // TODO --> Check all other TODOs

        let select3 = d.createElement('div')
        select3.classList.add('select-3')

        select3.id = el.id

        let label = d.querySelector('label[for="' + el.id + '"]')

        if (label !== null) {
            label.addEventListener('click', () => {
                openCloseSelect3(select3)
            })
        }

        if (el.multiple) {
            select3.classList.add('multiple')
        }

        let inner = d.createElement('div')
        inner.classList.add('inner')

        let optGroups = el.querySelectorAll('optgroup')
        let opts = el.querySelectorAll('option')

        // In case there are no optgroups, append all options to 'inner'
        if (!optGroups.length) {
            appendOptions(el, select3, inner, opts, el.multiple)
        } else {
            optGroups.forEach(group => {
                let optGroupEl = d.createElement('div')
                optGroupEl.classList.add('optgroup')

                let optGroupTitle = d.createElement('span')
                optGroupTitle.classList.add('title')
                optGroupTitle.textContent = group.label

                optGroupEl.append(optGroupTitle)

                let groupOptions = group.querySelectorAll('option')

                appendOptions(el, select3, optGroupEl, groupOptions,  el.multiple)

                inner.append(optGroupEl)
            })
        }

        select3.append(inner)

        newSelects.push(select3)
    }

    for (let i = 0; i < newSelects.length; i++) {
        elements[i].parentNode.append(newSelects[i]) // TODO --> Fix this to insert after OG select
        // insertAfter(newSelects[i], elements[i].parentNode.lastElementChild);
    }

    function openCloseSelect3(select) {
        let dropdown = select.querySelector('.inner')
        let dropdownHeight = dropdown.scrollHeight

        select.classList.toggle('opened')

        if (select.classList.contains('opened')) {
            dropdown.style.maxHeight = dropdownHeight + 'px'
        } else {
            dropdown.style.maxHeight =  '0px'
        }
    }

    function appendOptions(originalSelect, select, parent, opts, isMultipleSelect) {

        for (let opt of opts) {
            let optEl = d.createElement('span')
            optEl.setAttribute('data-value', opt.value.toString())

            // Transfer data- attributes
            if (Object.keys(opt.dataset).length) {
                let optDataSet = opt.dataset;
                for (const property in optDataSet) {
                    optEl.setAttribute('data-' + property, optDataSet[property])
                }
            }

            // Copy selected node for use at the top of select3
            if (opt.selected) {
                optEl.classList.add('selected')

                let clone = optEl.cloneNode()
                clone.classList.add('selected-top')

                if (opt.label.length) {
                    clone.textContent = opt.label
                } else {
                    clone.textContent = opt.text
                }
                clone.addEventListener('click', () => {
                    openCloseSelect3(select)
                })
                select.prepend(clone)
                optEl.setAttribute('data-selected', '1')
            } else {
                optEl.setAttribute('data-selected', '0')
            }

            if (opt.label.length) {
                optEl.textContent = opt.label
            } else {
                optEl.textContent = opt.text
            }

            if (opt.disabled) {
                optEl.classList.add('disabled')
            }

            // Add event listeners to all options
            optEl.addEventListener('click', (e) => {

                originalSelect.value = optEl.getAttribute('data-value')

                // Set behaviour depending on if the select is multiple choice or not
                if (!isMultipleSelect) {
                    select.querySelectorAll('.inner span').forEach(child => {
                        child.classList.remove('selected')
                        child.setAttribute('data-selected', '0')
                    })
                    optEl.classList.add('selected')
                    optEl.setAttribute('data-selected', '1')
                } else {
                    if (optEl.getAttribute('data-selected') === '1') {
                        optEl.setAttribute('data-selected', '0')
                    } else if (optEl.getAttribute('data-selected') === '0') {
                        optEl.setAttribute('data-selected', '1')
                    }
                }

                let form = d.querySelector('form#form')
                let formData = new FormData(form)
                console.log(formData)

                // var http = new XMLHttpRequest()
                // http.open("POST", "tests.localhost/Select3", true)
                // http.setRequestHeader("Content-type","multipart/form-data")
                // http.send(formData)

                let el = e.target
                let cloneEl = el.cloneNode()

                cloneEl.textContent = el.textContent
                cloneEl.classList.add('selected-top')

                cloneEl.addEventListener('click', () => {
                    openCloseSelect3(select)
                })

                if (options.closeOnSelect) {
                    openCloseSelect3(select)
                }
                select.querySelector('.selected-top').replaceWith(cloneEl)
            })

            parent.append(optEl)
        }
    }

    function applyOptions() {
        const opts = {
            closeOnSelect: true,
        }

        for (let property in options) {
            // If 'options' argument contains a non-supported property, don't add it to 'opts'.
            if (opts.hasOwnProperty(property)) {

                // Only add valid properties to opts
                if (isValid(property, options[property])) {
                    opts[property] = options[property]
                }
            }
        }

        // const resolvedOptions = resolveConflicts(options, opts);
        // Adopt resolved options
        // for (let property in resolvedOptions) {
        //     opts[property] = resolvedOptions[property];
        // }

        return opts
    }

    function isValid(property, value) {

        let isValid = false;

        switch (property) {

            case 'closeOnSelect':
                typeof value === 'boolean' ? isValid = true : isValid = false;
                break;

            default:
                break;
        }

        return isValid;
    }
}

// Program start
Select3('.select3.groups',{
    closeOnSelect: false,
})

Select3('.select3.no-close',{
    closeOnSelect: false,
})