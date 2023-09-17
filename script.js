const d = document

function Select3(selector, options) {

    // If any options were set, apply them
    options = applyOptions()

    const elements = d.querySelectorAll(selector)

    for (let el of elements) {

        if (el.tagName !== 'SELECT') continue

        // TODO --> Arrow on right side of select
        // TODO --> Add placeholder
        // TODO --> Escape the text in <option>...should I really tho? up to the user surely...
        // TODO --> Implement search
        // TODO --> Add 'x' icon on tags in multiple select, enabling them to be removed
        // TODO --> Add 'maxShownTags' option for multiple selects
        // TODO --> Add a 'maximumSelectedOptions' option for multiple selects
        // TODO --> Consider if select should close when clicking on the opt group title
        // TODO --> 'submitFormOnSelect' option that takes an id selector of form. Submit with on 'change' event
        // TODO --> Check all other TODOs

        let select3 = d.createElement('div')
        select3.classList.add('select3')

        select3.id = el.id

        select3.addEventListener('click', (e) => {
            if (el.multiple && e.target.classList.contains('select3')) {
                openCloseSelect3(select3)
            } else if (!el.multiple && e.target.classList.contains('selected-top')) {
                openCloseSelect3(select3)
            }
        })

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
                let optDataSet = opt.dataset
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

                if (isMultipleSelect) {
                    let close = document.createElement('b')
                    close.classList.add('remove')
                    close.textContent = '×'
                    clone.prepend(close)
                }

                select.prepend(clone)

                optEl.classList.add('selected')
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
            } else {
                optEl.addEventListener('click', (e) => {

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
                            optEl.classList.remove('selected')
                            optEl.setAttribute('data-selected', '0')
                        } else if (optEl.getAttribute('data-selected') === '0') {
                            optEl.classList.add('selected')
                            optEl.setAttribute('data-selected', '1')
                        }
                    }

                    let el = e.target
                    let cloneEl = el.cloneNode()

                    cloneEl.textContent = el.textContent
                    cloneEl.classList.add('selected-top')

                    if (isMultipleSelect) {
                        let close = document.createElement('b')
                        close.classList.add('remove')
                        close.textContent = '×'
                        cloneEl.prepend(close)
                    }

                    if (options.closeOnSelect) {
                        openCloseSelect3(select)
                    }

                    let selectedChildren = select.childNodes
                    let isOptionAlreadySelected = false

                    for (let child of selectedChildren) {
                        if (child.getAttribute('data-value') === cloneEl.getAttribute('data-value')) {
                            isOptionAlreadySelected = true
                            break
                        }
                    }

                    if (!isOptionAlreadySelected) {
                        if (isMultipleSelect) {
                            select.insertBefore(cloneEl, select.querySelector('.inner'))
                            opt.setAttribute('selected', 'selected')
                        } else {
                            select.querySelector('.selected-top').replaceWith(cloneEl)
                        }
                    } else {
                        if (isMultipleSelect) {
                            select.querySelector(':scope > span[data-value="' + cloneEl.getAttribute('data-value') + '"]').remove()
                            opt.removeAttribute('selected')
                        }
                    }
                })
            }

            parent.append(optEl)
        }

        // Enable deselection option in multiple select by clicking on the 'X' in the tag
        if (isMultipleSelect) {
            select.querySelectorAll('b.remove').forEach(el => {
                el.addEventListener('click', (e) => {
                    removeOption(originalSelect, select, e.target.parentElement)
                })
            })
        }
    }

    function removeOption(originalSelect, select, option) {

        let value = option.getAttribute('data-value')

        let originalSelectOption = originalSelect.querySelector('option[value="' + value + '"]')

        originalSelectOption.removeAttribute('selected')

        console.log(originalSelectOption)

        let select3Option = select.querySelector('.inner span[data-value="' + value + '"]')

        console.log(select3Option)

        select3Option.classList.remove('selected')
        select3Option.setAttribute('data-selected', '0')
    }

    function applyOptions() {
        /* All possible options and their default values */
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

/* Handle closing of select when clicking outside it */
// d.addEventListener('click', (e) => {
//     let el = e.target
//     let clickedSelect = el.closest('.select3')
//     console.log(clickedSelect)
//
//     // If no parent has class "select3"
//     if (clickedSelect === null) {
//         d.querySelectorAll('div.select3').forEach(node => {
//             let dropdown = node.querySelector('.inner')
//             node.classList.remove('opened')
//             dropdown.style.maxHeight =  '0px'
//         })
//     } else {
//         d.querySelectorAll('div.select3').forEach(node => {
//             if (!node.isEqualNode(clickedSelect)) {
//                 let dropdown = node.querySelector('.inner')
//                 node.classList.remove('opened')
//                 dropdown.style.maxHeight =  '0px'
//             }
//         })
//     }
// })

// d.querySelector('button').addEventListener('click', (e) => {
//     e.preventDefault()
//     const formData = new FormData(e.target.closest('form'))
//     console.log(formData)
// })