console.log(document.getElementById('select3'))

Element.prototype.Select3 = function(config) {

    const select = this

    // If any options were set, apply them
    config = Select3_applyConfig(config)
    // console.table(config)

    if (select.tagName !== 'SELECT') return false

    // TODO --> Add option to format options ( add user html into option <span> )
    // TODO --> Change forEach loops to for-of loops
    // TODO --> 'submitFormOnSelect' option that takes an id selector of form. Submit with on 'change' event (dispatchEvent(new Event('change')))
    // TODO --> Check multiple scenarios ( single selection with and without optgroups and multiple selection with and without optgroups etc. )
    // TODO --> Check all other TODOs in IDE
    // TODO --> Transfer data- attributes from original select to select3...should I really tho? Consider...
    // TODO --> Try overriding with custom .css styles
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
        const targetClasses = e.target.classList
        if (targetClasses.contains('select3') || targetClasses.contains('selected-top') || targetClasses.contains('placeholder')) {
            Select3_openCloseSelect3(select3, config)
        }
    })


    if (select.selectedOptions.length > config.maximumSelectedOptions) {
        config.maximumSelectedOptions = select.selectedOptions.length
    }

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

        // TODO - consider this
        if (config.placeholder !== '') {
            input.setAttribute('placeholder', config.placeholder)
        }

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
        // label.classList.add('for-select3')
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

    if (select.multiple && select.selectedOptions.length === 0 && config.placeholder !== '') {
        let placeholder = document.createElement('span')
        placeholder.classList.add('placeholder')
        placeholder.textContent = config.placeholder
        select3.prepend(placeholder)
    }

    select.style.display = 'none'
    select.parentNode.insertBefore(select3, select.nextSibling)

    // Appends val() function to all selects, returning array of all selected values.
    select.val = function() {
        let value = []
        for (let selOpt of select.selectedOptions) {
            value.push(selOpt.value)
        }
        return value
    }

    return select
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

    if (config.search) {
        select3.querySelector('input.search').value = ''
        let childNodes = select3.querySelectorAll('span:not(.title)')
        Select3_filterInput('', childNodes)
    }
}

function Select3_appendOptions(select, select3, parent, opts, isMultipleSelect, config) {

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
            } else {
                // If first option is empty, make it a placeholder
                if (config.placeholder !== '' && select[0] === opt && opt.textContent === '') {
                    clone.classList.add('placeholder')
                    clone.textContent = config.placeholder
                }
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

        // Placeholder option for regular select
        if (!isMultipleSelect && config.placeholder !== '' && select[0] === opt && opt.textContent === '') {
            optEl.classList.add('placeholder')
            optEl.textContent = config.placeholder
        }

        optEl.addEventListener('click', (e) => {

            let el = e.target
            let cloneEl = el.cloneNode()

            cloneEl.textContent = el.textContent
            cloneEl.classList.add('selected-top')

            // Can only do stuff if the option in the original select is not disabled
            if (!opt.disabled) {

                // If user selects an option, whilst already having max selected options
                if (select.selectedOptions.length >= config.maximumSelectedOptions && optEl.getAttribute('data-selected') === '0') {
                    return
                }

                let selectedOptions = select.selectedOptions
                let isOptionAlreadySelected = false

                for (let selOpt of selectedOptions) {
                    if (selOpt.getAttribute('value') === cloneEl.getAttribute('data-value')) {
                        isOptionAlreadySelected = true
                        break
                    }
                }

                // Handle selecting/deselecting
                if (!isMultipleSelect && !isOptionAlreadySelected) {
                    select.querySelectorAll('option').forEach(child => {
                        child.removeAttribute('selected')
                    })

                    select3.querySelectorAll('.inner span').forEach(child => {
                        child.classList.remove('selected')
                        child.setAttribute('data-selected', '0')
                    })

                    opt.setAttribute('selected', 'selected')
                    select3.querySelector('.selected-top').replaceWith(cloneEl)
                    optEl.classList.add('selected')
                    optEl.setAttribute('data-selected', '1')

                    // Trigger 'change' event only on regular select only if option is not already selected.
                    select.dispatchEvent(new Event('change'))

                } else if (isMultipleSelect) {

                    if (isOptionAlreadySelected) {
                        select3.querySelector(':scope > span[data-value="' + cloneEl.getAttribute('data-value') + '"]').remove()
                        opt.removeAttribute('selected')
                        optEl.classList.remove('selected')
                        optEl.setAttribute('data-selected', '0')

                        if (select.selectedOptions.length === 0 && config.placeholder !== '') {
                            let placeholder = document.createElement('span')
                            placeholder.classList.add('placeholder')
                            placeholder.textContent = config.placeholder
                            select3.prepend(placeholder)
                        }
                    } else {
                        select3.insertBefore(cloneEl, select3.querySelector('.inner'))
                        opt.setAttribute('selected', 'selected')
                        optEl.classList.add('selected')
                        optEl.setAttribute('data-selected', '1')

                        // Only happens if the option that was just clicked was the first selected option.
                        if (select.selectedOptions.length === 1) {
                            select3.querySelector(':scope > span.placeholder').remove()
                        }
                    }

                    let closeBtn = document.createElement('b')
                    closeBtn.classList.add('remove')
                    closeBtn.textContent = '×'
                    cloneEl.prepend(closeBtn)

                    closeBtn.addEventListener('click', (e) => {
                        Select3_removeOption(select, select3, e.target.parentElement, true)
                    })

                    select.dispatchEvent(new Event('change'))
                }

                if (config.closeOnSelect) {
                    Select3_openCloseSelect3(select3, config)
                }
            }
        })

        // select.dispatchEvent(new Event('test_test'))

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

    // TODO - review if removeOption is even needed...
    if (removeOption) {
        option.remove()
    }

    // Needed because anytime an option is deselected by clicking on the 'x' in the tags, the <select>'s value is updated.
    select.dispatchEvent(new Event('change'))
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
        maximumSelectedOptions: 100,
        // allowNoSelection: false,
        submitFormOnChange: ''
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
            // Does check for length of placeholder less than 1000 make sense? I think so...TODO --> review
            typeof value === 'string' && value.length > 0 && value.length < 1000 ? isValid = true : isValid = false
            break

        case 'dropdownMaxHeight':
            typeof value === 'number' && value > 0 ? isValid = true : isValid = false
            break

        // case 'allowNoSelection':
        //     typeof value === 'boolean' ? isValid = true : isValid = false
        //     break

        case 'maximumSelectedOptions':
            typeof value === 'number' && value > 0 ? isValid = true : isValid = false
            break

        case 'submitFormOnChange':
            // Does check for length of selector less than 1000 make sense? I think so...TODO --> review
            typeof value === 'string' && value.length > 0 && value.length < 1000 ? isValid = true : isValid = false
            break

        default:
            break
    }

    return isValid
}

// Program start
let test = document.querySelector('.select3.groups').Select3({
    search: true,
    closeOnSelect: false,
    minimumInputLength: 2,
    dropdownMaxHeight: 300,
    maximumSelectedOptions: 4,
    placeholder: 'Please select an option',
})

test.addEventListener('change', () => {
    console.log(test.val())
})

document.querySelector('.select3.no-close').Select3({
    search: true,
    closeOnSelect: false,
    minimumInputLength: 2,
    dropdownMaxHeight: 300,
    allowNoSelection: true,
    placeholder: 'Please select an option...',
})

// document.querySelector('button[type="submit"]').addEventListener('click', (e) => {
//     e.preventDefault()
//
//     const formData = new FormData(e.target.closest('form'))
//
//     console.log(formData)
// })

/* Handle closing of select when clicking outside it */
/* Consider claring search input when this happens */
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