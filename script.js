function Select3(selector, options) {

    // If any options were set, apply them
    options = applyOptions()
    console.log(options)

    const elements = document.querySelectorAll(selector)

    for (let el of elements) {

        if (el.tagName !== 'SELECT') continue

        // TODO --> Arrow on right side of select
        // TODO --> Add placeholder
        // TODO --> Add 'maxShownTags' option for multiple selects
        // TODO --> Add a 'maximumSelectedOptions' option for multiple selects
        // TODO --> Add some sort of option to allow empty selection ( needed for deciding when to show the placeholder as well )
        // TODO --> Consider option to allow user to click on an already selected option to unselect it
        // TODO --> Try with form POSTs
        // TODO --> 'submitFormOnSelect' option that takes an id selector of form. Submit with on 'change' event (dispatchEvent(new Event('change')))
        // TODO --> Check all scenarios (single selection with and without optgroups and multiple selection with and without optgroups)
        // TODO --> Check all other TODOs
        // TODO --> Test on mobile

        let select3 = document.createElement('div')
        select3.classList.add('select3')

        select3.id = el.id

        for (cls of el.classList) {
            select3.classList.add(cls)
        }

        if (options.placeholder.length > 0) {
            let placeholder = document.createElement('span')
            placeholder.classList.add('placeholder')
            placeholder.textContent = options.placeholder
            select3.prepend(placeholder)
        }

        // Handles closing
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

        let inner = document.createElement('div')
        inner.classList.add('inner')

        // Add search input
        if (options.search) {
            let input = document.createElement('input')
            input.classList.add('search')
            input.setAttribute('type', 'search')

            let previousSearchLength = 0

            input.addEventListener('keyup', (e) => {

                let searchLength = e.target.value.length

                if (searchLength >= options.minimumInputLength || searchLength < previousSearchLength) {
                    let childNodes = e.target.parentElement.querySelectorAll('span:not(.title)')
                    filterInput(e.target.value, childNodes)
                }

                previousSearchLength = searchLength
            })
            inner.prepend(input)
        }

        let label = document.querySelector('label[for="' + el.id + '"]')

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
            // if (el[0].tagName === 'OPTION') { /* TODO The fuck je ta if?? WHY?!?!? */
            //     console.log('WACKY IF')
            //     let nodeList = el.querySelectorAll(':scope > option')
            //     appendOptions(el, select3, inner, nodeList, false)
            // }

            optGroups.forEach(group => {
                let optGroupEl = document.createElement('div')
                optGroupEl.classList.add('optgroup')

                let optGroupTitle = document.createElement('span')
                optGroupTitle.classList.add('title')
                optGroupTitle.textContent = group.label

                optGroupEl.append(optGroupTitle)

                let groupOptions = group.querySelectorAll('option')

                appendOptions(el, select3, optGroupEl, groupOptions,  el.multiple)

                inner.append(optGroupEl)
            })
        }

        // Enable deselection option in multiple select by clicking on the 'X' in the tag
        if (el.multiple) {
            select3.querySelectorAll('b.remove').forEach(elem => {
                elem.addEventListener('click', (e) => {
                    removeOption(el, select3, e.target.parentElement)
                })
            })
        }
        select3.append(inner)

        el.style.display = 'none'
        el.parentNode.insertBefore(select3, el.nextSibling)
    }

    function openCloseSelect3(select) {
        let dropdown = select.querySelector('.inner')
        let dropdownHeight = dropdown.scrollHeight > options.dropdownMaxHeight ? options.dropdownMaxHeight : dropdown.scrollHeight

        select.classList.toggle('opened')

        if (select.classList.contains('opened')) {
            dropdown.style.maxHeight = dropdownHeight + 'px'
        } else {
            dropdown.style.maxHeight =  '0px'
        }
    }

    function appendOptions(originalSelect, select, parent, opts, isMultipleSelect) {

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
                    let close = document.createElement('b')
                    close.classList.add('remove')
                    close.textContent = '×'
                    clone.prepend(close)
                }

                select.append(clone)

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

        console.log(select)
    }

    function removeOption(originalSelect, select, option) {

        let value = option.getAttribute('data-value')

        let originalSelectOption = originalSelect.querySelector('option[value="' + value + '"]')

        originalSelectOption.removeAttribute('selected')
        let select3Option = select.querySelector('.inner span[data-value="' + value + '"]')

        select3Option.classList.remove('selected')
        select3Option.setAttribute('data-selected', '0')

        option.remove()
    }

    function filterInput(filter, options) {
        filter = filter.toUpperCase();
        for (opt of options) {
            txtValue = opt.textContent || opt.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                opt.style.display = ''
            } else {
                opt.style.display = 'none'
            }

            let isAnyOptionVisible = false
            let siblings = opt.parentElement.querySelectorAll('span:not(.title)')

            // console.log(siblings)

            for (sibling of siblings) {
                if (sibling.style.display !== 'none') {
                    isAnyOptionVisible = true
                    break
                }
            }

            if (isAnyOptionVisible) {
                opt.parentElement.style.display = ''
            } else {
                opt.parentElement.style.display = 'none'
            }
        }
    }

    function applyOptions() {
        /* All possible options and their default values */
        const opts = {
            search: true,
            closeOnSelect: true,
            // allowNoSelection: false,
            minimumInputLength: 3,
            placeholder: '',
            dropdownMaxHeight: 300,
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

            default:
                break
        }

        return isValid
    }
}

// Program start
Select3('.select3.groups',{
    search: true,
    closeOnSelect: false,
    minimumInputLength: 1,
    dropdownMaxHeight: 300,
    placeholder: 'Please select an option',
})

// Select3('.select3.no-close',{
//     closeOnSelect: false,
// })

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