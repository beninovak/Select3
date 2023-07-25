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

        if (el.tagName !== 'SELECT') continue;

        // TODO --> Get all selected options from OG <select>
        // TODO --> Escape the text in <option>
        // TODO --> Have "allowNoSelection" option for if you want to deselect or select nothing
        // TODO --> Open select3 when clicking on its <label>
        // TODO --> Close select when clicking outside of it

        let select3 = d.createElement('div')
        select3.classList.add('select-3')

        let inner = d.createElement('div')
        inner.classList.add('inner')

        if (el.multiple) {
            select3.classList.add('multiple')
        }

        let optGroups = el.querySelectorAll('optgroup')
        let opts = el.querySelectorAll('option')

        // In case there are no optgroups, append all options to 'inner'
        if (!optGroups.length) {

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
                    let clone = optEl.cloneNode()
                    clone.classList.add('selected-top')

                    if (opt.label.length) {
                        clone.textContent = opt.label
                    } else {
                        clone.textContent = opt.text
                    }
                    clone.addEventListener('click', () => {
                        closeSelect3(select3)
                    })
                    select3.prepend(clone)
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

                inner.append(optEl)
            }

        } else {

        }

        select3.append(inner)

        select3.querySelectorAll('.inner > span').forEach(el => {
            el.addEventListener('click', (e) => {
                let el = e.target
                let cloneEl = el.cloneNode()
                cloneEl.textContent = el.textContent
                cloneEl.classList.add('selected-top')

                if (options.closeOnSelect) {
                    cloneEl.addEventListener('click', (e) => {
                        closeSelect3(select3)
                    })
                    closeSelect3(select3)
                }
                select3.querySelector('.selected-top').replaceWith(cloneEl)
            })
        })

        newSelects.push(select3)
    }

    for (let i = 0; i < newSelects.length; i++) {
        elements[i].parentNode.append(newSelects[i]) // TODO --> Fix this to insert after OG select
        // insertAfter(newSelects[i], elements[i].parentNode.lastElementChild);
    }

    function closeSelect3(select) {
        let dropdown = select.querySelector('.inner')
        let dropdownHeight = dropdown.scrollHeight

        select.classList.toggle('opened')

        if (select.classList.contains('opened')) {
            dropdown.style.maxHeight = dropdownHeight + 'px'
        } else {
            dropdown.style.maxHeight =  '0px'
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
Select3('.select3',{
    closeOnSelect: true,
})