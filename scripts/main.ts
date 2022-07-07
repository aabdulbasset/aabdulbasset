
import { gsap } from "gsap";


//Cursor
const navElements = document.querySelectorAll('.nav-links a');
navElements.forEach(element => {
    element.addEventListener('mouseover',function handleMouseOver(e){
        addCursor(e.target)
    })
    element.addEventListener('mouseleave',function handleMouseLeave(){
        removeCursor()
    })
    // Selector
    element.addEventListener('click',(e)=>{
        removeAllSelected()
        let ee = e as PointerEvent
        addSelected(e.target)
        removeCursor()
    })

})
//Cursor functions
let element = document.createElement('div')
function addCursor(target){
    element.id = 'cursor'
    if(!target.classList.contains('selected')){
        target.appendChild(element)
    }
    
}
function removeCursor(){
    document.querySelectorAll("#cursor").forEach(element => {
        element.remove()
    })
}
//Selector Function

function addSelected(target){
    target.classList.add('selected')
}
function removeAllSelected(){
    navElements.forEach(element => {
        element.classList.remove('selected')
    })
}
// ***************************************************
const logo = document.querySelector('.logo-img')
const logoParent = document.querySelector('.nav-logo');
let left = 0
// Logo animation
let logoAnimation = gsap.to(logo,{
    duration:1,
    y:-10,
    yoyo:true,
    repeat:-1,
    onRepeat:animationCompleted
})
logoAnimation.pause()
logoParent.addEventListener('mouseover',handleMouseOver)
logoParent.addEventListener('mouseleave',handleMouseLeave)
function handleMouseOver(){
    left = 0
    logoAnimation.play()
}
function animationCompleted(){
   if(logoAnimation.progress() < 0.1 && left === 1 ){
    logoAnimation.pause()
   }
}
function handleMouseLeave(){
    left = 1
}