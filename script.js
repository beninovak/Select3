const d = document

function Select3(selector, options) {

    // If any options were set, apply them
    options = applyOptions()

    const elements = d.querySelectorAll(selector)

    for (let el of elements) {

        if (el.tagName !== 'SELECT') continue

        // TODO --> Get all selected options from OG <select>
        // TODO --> Escape the text in <option>
        // TODO --> Implement search
        // TODO --> Close select when clicking outside of it
        // TODO --> 'submitFormOnSelect' option that takes an id selector. Submit with on 'change' event
        // TODO --> Check all other TODOs

        let select3 = d.createElement('div')
        select3.classList.add('select3')

        select3.id = el.id

        if (el.multiple) {
            select3.classList.add('multiple')
        }

        let inner = d.createElement('div')
        inner.classList.add('inner')

        let label = d.querySelector('label[for="' + el.id + '"]')

        if (label !== null) {
            label.classList.add('for-select3')
            label.addEventListener('click', () => {
                openCloseSelect3(select3)
            })
        }

        let optGroups = el.querySelectorAll('optgroup')
        let opts = el.querySelectorAll('option')

        // In case there are no optgroups, append all options to 'inner'
        if (!optGroups.length) {
            appendOptions(el, select3, inner, opts, el.multiple)
        } else {
            if (el[0].tagName === 'OPTION') {
                let nodeList = el.querySelectorAll(':scope > option')
                appendOptions(el, select3, inner, nodeList, false)
            }

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

        el.style.display = 'none'
        el.parentNode.insertBefore(select3, el.nextSibling)
    }

    function openCloseSelect3(select) {
        let dropdown = select.querySelector('.inner')
        let dropdownHeight = dropdown.scrollHeight

        select.classList.toggle('opened')

        if (select.classList.contains('opened')) {
            console.log('OPENING')
            dropdown.style.maxHeight = dropdownHeight + 'px'
        } else {
            dropdown.style.maxHeight =  '0px'
        }
    }

    function appendOptions(originalSelect, select, parent, opts, isMultipleSelect) {

        let noOptionSelected = true

        for (let opt of opts) {
            if (opt.selected) {
                noOptionSelected = false
                break
            }
        }

        for (let opt of opts) {
            let optEl = d.createElement('span')
            optEl.setAttribute('data-value', opt.value.toString())

            // Transfer data- attributes
            if (Object.keys(opt.dataset).length) {
                let optDataSet = opt.dataset
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
            allowNoSelection: false,
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

        // const resolvedOptions = resolveConflicts(options, opts)
        // Adopt resolved options
        // for (let property in resolvedOptions) {
        //     opts[property] = resolvedOptions[property]
        // }

        return opts
    }

    function isValid(property, value) {

        let isValid = false

        switch (property) {

            case 'closeOnSelect':
                typeof value === 'boolean' ? isValid = true : isValid = false
                break

            default:
                break
        }

        return isValid
    }
}

// Program start
Select3('.select3.groups',{
    closeOnSelect: true,
})

Select3('.select3.no-close',{
    closeOnSelect: false,
})

// Check if user clicks outside select. If so, close select3s.
// d.addEventListener('click', (e) => {
//     let el = e.target
//
//     if (el.tagName === 'LABEL' && el.classList.contains('for-select3')) {
//         e.preventDefault()
//     }
//
//     if (!(el.tagName === 'LABEL' && el.classList.contains('for-select3')) || el.closest('div.select3') === null) {
//         console.log('DOCUMENT')
//         d.querySelectorAll('div.select3').forEach(el => {
//             let dropdown = el.querySelector('.inner')
//             el.classList.remove('opened')
//             dropdown.style.maxHeight =  '0px'
//         })
//     }
// })