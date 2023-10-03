function Select3(selector, config) {

    // If any options were set, apply them
    config = Select3_applyConfig(config)
    console.table(config)

    const elements = document.querySelectorAll(selector)

    for (let select of elements) {

        if (select.tagName !== 'SELECT') continue

        // TODO --> Add a 'maximumSelectedOptions' option for multiple selects. [ What to do when more are already preselected? Maybe ignore all above given max?? ]
        // TODO --> Add 'maxShownTags' option for multiple selects
        // TODO --> Add placeholder
        // TODO --> Add some sort of option to allow empty selection ( needed for deciding when to show the placeholder as well )
        // TODO --> Try with form POSTs
        // TODO --> 'submitFormOnSelect' option that takes an id selector of form. Submit with on 'change' event (dispatchEvent(new Event('change')))
        // TODO --> Check all scenarios (single selection with and without optgroups and multiple selection with and without optgroups)
        // TODO --> Check all other TODOs
        // TODO --> Test on mobile
        // TODO --> Minimize file: https://codebeautify.org/minify-js

        let select3 = document.createElement('div')
        select3.classList.add('select3')

        select3.id = select.id

        for (let cssClass of select.classList) {
            select3.classList.add(cssClass)
        }

        // Handles closing
        select3.addEventListener('click', (e) => {
            if (select.multiple && (e.target.classList.contains('select3') || e.target.classList.contains('selected-top'))) {
                Select3_openCloseSelect3(select3, config)
            } else if (!select.multiple && e.target.classList.contains('selected-top')) {
                Select3_openCloseSelect3(select3, config)
            }
            // else if (e.target.classList.contains('placeholder')) {
            //     Select3_openCloseSelect3(select3, config)
            // }
        })

        if (select.multiple) {
            select3.classList.add('multiple')
        } else {
            select3.classList.add('single')
        }

        let inner = document.createElement('div')
        inner.classList.add('inner')

        // Search input
        if (config.search) {
            let input = document.createElement('input')
            input.classList.add('search')
            input.setAttribute('type', 'search')

            let previousSearchLength = 0

            input.addEventListener('keyup', (e) => {

                let searchLength = e.target.value.length

                if (searchLength >= config.minimumInputLength || searchLength < previousSearchLength) {
                    let childNodes = e.target.parentElement.querySelectorAll('span:not(.title)')
                    Select3_filterInput(e.target.value, childNodes)
                }

                previousSearchLength = searchLength
            })
            inner.prepend(input)
        }

        let label = document.querySelector('label[for="' + select.id + '"]')

        if (label !== null) {
            label.classList.add('for-select3')
            label.addEventListener('click', () => {
                Select3_openCloseSelect3(select3, config)
            })
        }

        let optGroups = select.querySelectorAll('optgroup')
        let opts = select.querySelectorAll('option')

        // In case there are no optgroups, append all options to 'inner'
        if (!optGroups.length) {
            Select3_appendOptions(select, select3, inner, opts, select.multiple, config)
        } else {
            optGroups.forEach(group => {
                let optGroupEl = document.createElement('div')
                optGroupEl.classList.add('optgroup')

                let optGroupTitle = document.createElement('span')
                optGroupTitle.classList.add('title')
                optGroupTitle.textContent = group.label

                optGroupEl.append(optGroupTitle)

                let groupOptions = group.querySelectorAll('option')

                Select3_appendOptions(select, select3, optGroupEl, groupOptions,  select.multiple, config)

                inner.append(optGroupEl)
            })
        }
        select3.append(inner)


        // Adds placeholder, but only if a null selection is permitted
        // if (config.allowNoSelection && config.placeholder.length > 0) {
        //     let placeholder = document.createElement('span')
        //     placeholder.classList.add('placeholder')
        //     placeholder.textContent = config.placeholder
        //     select3.prepend(placeholder)
        //
        //     // Check if placeholder should be shown based on whether the only selected option is-
        //     // an option with value="".
        //     if (select.selectedOptions.length === 1 && select.selectedOptions[0].value === '') {
        //         select3.querySelector('span.placeholder').style.display = 'block'
        //         select3.querySelectorAll('span.selected-top').forEach(opt => {
        //             opt.style.display = 'none'
        //         })
        //     }
        // }

        select.style.display = 'none'
        select.parentNode.insertBefore(select3, select.nextSibling)
    }
}

function Select3_openCloseSelect3(select3, config) {
    let dropdown = select3.querySelector('.inner')
    let dropdownHeight = dropdown.scrollHeight > config.dropdownMaxHeight ? config.dropdownMaxHeight : dropdown.scrollHeight

    select3.classList.toggle('opened')

    if (select3.classList.contains('opened')) {
        dropdown.style.maxHeight = dropdownHeight + 'px'
    } else {
        dropdown.style.maxHeight =  '0px'
    }
}

function Select3_appendOptions(select, select3, parent, opts, isMultipleSelect, config) {
    // let anyOptionSelected = false

    for (let opt of opts) {
        let optEl = document.createElement('span')
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

                let closeBtn = document.createElement('b')
                closeBtn.classList.add('remove')
                closeBtn.textContent = '×'

                // Enable deselection option in multiple select by clicking on the 'X' in the tag
                closeBtn.addEventListener('click', (e) => {
                    Select3_removeOption(select, select3, e.target.parentElement, true)
                })

                clone.prepend(closeBtn)
            }

            select3.append(clone)

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
        }

        optEl.addEventListener('click', (e) => {

            // Can only do stuff if the option in the original select is not disabled
            if (!opt.disabled) {

                if (select.selectedOptions.length >= config.maximumSelectedOptions) {

                    let value = e.target.dataset.value
                    let tag = select3.querySelector(':scope > span[data-value="' + value + '"]')

                    Select3_removeOption(select, select3, e.target, false) // Deselect option
                    Select3_removeOption(select, select3, tag, true) // Remove tag
                    return
                }

                // Set behaviour depending on if the select is multiple choice or not
                if (!isMultipleSelect) {
                    select3.querySelectorAll('.inner span').forEach(child => {
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
                    let closeBtn = document.createElement('b')
                    closeBtn.classList.add('remove')
                    closeBtn.textContent = '×'
                    cloneEl.prepend(closeBtn)

                    closeBtn.addEventListener('click', (e) => {
                        Select3_removeOption(select, select3, e.target.parentElement, true)
                    })
                }

                if (config.closeOnSelect) {
                    Select3_openCloseSelect3(select3, config)
                }

                let selectedChildren = select3.childNodes
                let isOptionAlreadySelected = false

                for (let child of selectedChildren) {
                    if (child.getAttribute('data-value') === cloneEl.getAttribute('data-value')) {
                        isOptionAlreadySelected = true
                        break
                    }
                }

                if (!isOptionAlreadySelected) {
                    if (isMultipleSelect) {
                        select3.insertBefore(cloneEl, select3.querySelector('.inner'))
                        opt.setAttribute('selected', 'selected')
                    } else {
                        select3.querySelector('.selected-top').replaceWith(cloneEl)
                    }
                } else {
                    if (isMultipleSelect) {
                        select3.querySelector(':scope > span[data-value="' + cloneEl.getAttribute('data-value') + '"]').remove()
                        opt.removeAttribute('selected')
                    }
                }
            }
        })

        parent.append(optEl)
    }
}

function Select3_removeOption(select, select3, option, removeOption) {
    let value = option.getAttribute('data-value')

    let selectOption = select.querySelector('option[value="' + value + '"]')

    selectOption.removeAttribute('selected')
    let select3Option = select3.querySelector('.inner span[data-value="' + value + '"]')

    select3Option.classList.remove('selected')
    select3Option.setAttribute('data-selected', '0')

    if (removeOption) {
        option.remove()
    }
}

function Select3_filterInput(filter, options) {

    filter = filter.toUpperCase()

    for (let opt of options) {
        let txtValue = opt.textContent || opt.innerText
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            opt.style.display = ''
        } else {
            opt.style.display = 'none'
        }

        let isAnyOptionVisible = false
        let siblings = opt.parentElement.querySelectorAll('span:not(.title)')

        for (let sibling of siblings) {
            if (sibling.style.display !== 'none') {
                isAnyOptionVisible = true
                break
            }
        }


        if (opt.closest('div.optgroup') !== null) {
            if (isAnyOptionVisible) {
                opt.closest('div.optgroup').style.display = ''
            } else {
                opt.closest('div.optgroup').style.display = 'none'
            }
        }
    }
}

function Select3_applyConfig(config) {

    /* All possible options and their default values */
    const confs = {
        search: true,
        closeOnSelect: true,
        minimumInputLength: 3,
        placeholder: '',
        dropdownMaxHeight: 300,
        maximumSelectedOptions: 10000,
        // allowNoSelection: false,
    }

    for (let property in config) {

        // If 'options' argument contains a non-supported property, don't add it to 'opts'
        if (confs.hasOwnProperty(property)) {
            // Only add valid properties to opts
            if (Select3_isOptionValid(property, config[property])) {
                confs[property] = config[property]
            }
        }
    }

    return confs
}

function Select3_isOptionValid(key, value) {

    let isValid = false

    switch (key) {

        case 'closeOnSelect':
            typeof value === 'boolean' ? isValid = true : isValid = false
            break

        case 'search':
            typeof value === 'boolean' ? isValid = true : isValid = false
            break

        case 'minimumInputLength':
            typeof value === 'number' && value > 0 ? isValid = true : isValid = false
            break

        case 'placeholder':
            typeof value === 'string' ? isValid = true : isValid = false
            break

        case 'dropdownMaxHeight':
            typeof value === 'number' && value > 0 ? isValid = true : isValid = false
            break

        case 'allowNoSelection':
            typeof value === 'boolean' ? isValid = true : isValid = false
            break

        case 'maximumSelectedOptions':
            typeof value === 'number' && value > 0 ? isValid = true : isValid = false
            break

        default:
            break
    }

    return isValid
}

// Program start
Select3('.select3.groups',{
    search: true,
    closeOnSelect: false,
    minimumInputLength: 2,
    dropdownMaxHeight: 300,
    maximumSelectedOptions: 3,
    placeholder: 'Please select an option',
})

Select3('.select3.no-close',{
    search: true,
    closeOnSelect: false,
    minimumInputLength: 2,
    dropdownMaxHeight: 300,
    allowNoSelection: true,
    placeholder: 'Please select an option...',
})

/* Handle closing of select when clicking outside it */
// document.addEventListener('click', (e) => {
//     let el = e.target
//     let clickedSelect = el.closest('.select3')
//     console.log(clickedSelect)
//
//     // If no parent has class "select3"
//     if (clickedSelect === null) {
//         document.querySelectorAll('div.select3').forEach(node => {
//             let dropdown = node.querySelector('.inner')
//             node.classList.remove('opened')
//             dropdown.style.maxHeight =  '0px'
//         })
//     } else {
//         document.querySelectorAll('div.select3').forEach(node => {
//             if (!node.isEqualNode(clickedSelect)) {
//                 let dropdown = node.querySelector('.inner')
//                 node.classList.remove('opened')
//                 dropdown.style.maxHeight =  '0px'
//             }
//         })
//     }
// })

// document.querySelector('button').addEventListener('click', (e) => {
//     e.preventDefault()
//     const formData = new FormData(e.target.closest('form'))
//     console.log(formData)
// })