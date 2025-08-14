const style = document.createElement('style');
style.textContent = `
#ingredients-filter label {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  margin-bottom: 6px;
}
#ingredients-filter label:hover { transform: none; box-shadow: none; }
#ingredients-filter strong {
  display: block;
  margin-bottom: 8px;
}
`;
document.head.appendChild(style);


const e = React.createElement;

const RECIPES_URL = "https://yumbook.github.io/app/recipes.json";
let RECIPES = [];
async function loadRecipes() {
    try {
        const response = await fetch(RECIPES_URL);
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        RECIPES = await response.json();
        initApp();
    } catch (err) {
        console.error('Impossible de charger les recettes :', err);
    }
}
const TOP_INGREDIENTS = {
  "🥛 Dairy": ["milk", "butter", "eggs", "cheese", "yogurt", "cream", "sour cream", "cream cheese", "ghee", "buttermilk"],
  "🥦 Vegetables": ['lettuce', 'tomato', 'onion', 'garlic', 'carrot', 'cucumber', 'spinach', 'bell pepper', 'broccoli', 'zucchini', 'celery', 'mushroom', 'asparagus', 'cauliflower', 'eggplant', 'radish', 'kale', 'green beans', 'peas', 'artichoke', 'leek', 'turnip', 'parsnip', 'beetroot', 'chard', 'brussels sprouts', 'pumpkin', 'sweet potato', 'yam', 'fennel', 'bok choy', 'cabbage', 'shallot'],
  "🍎 Fruits": ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'watermelon', 'melon', 'pineapple', 'mango', 'peach', 'pear', 'plum', 'cherry', 'apricot', 'kiwi', 'papaya', 'pomegranate', 'lime'],
  "🍗 Meat / Protein": ["chicken", "beef", "pork", "fish", "bacon", "ham", "turkey", "shrimp", "sausage", "lamb", "duck"],
  "🍯 Condiments & Sauces": ["ketchup", "mayonnaise", "mustard", "soy sauce", "hot sauce", "vinegar", "barbecue sauce", "salad dressing", "pesto", "salsa"],
  "🍞 Staples": ["bread", "rice", "pasta", "flour", "sugar", "baking powder", "baking soda", "cornstarch", "oats", "yeast"],
  "🍋 Other": ["lemon", "lime", "olive oil", "vegetable oil", "salt", "pepper", "honey", "peanut butter", "jam", "maple syrup"],
  "🍷 Alcohol": ["beer", "wine", "whiskey", "vodka", "rum", "gin", "tequila", "champagne", "brandy", "liqueur"]
};

function linkify(text) {
  if (!text) return '';
  // Add line break before 'Vidéo' or 'Videos' (case-insensitive)
  text = text.replace(/(\s*)(vidéo|videos)/ig, '<br>$2');
  if (/<a\s/i.test(text) || /&lt;a\s/i.test(text)) {
    return text.replace(/<a\b([^>]*)>/gi, function(match, attrs) {
      if (/target\s*=\s*['"]?_blank['"]?/i.test(attrs)) return `<a${attrs}>`;
      return `<a${attrs} target="_blank">`;
    });
  }
  const urlPattern = /(https?:\/\/[^\s'"]+)/g;
  return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
}

function App(){

  const [q, setQ] = React.useState("");
  const [course, setCourse] = React.useState("");
  const [tag, setTag] = React.useState("");
  const [selectedIngs, setSelectedIngs] = React.useState([]);
  const [open, setOpen] = React.useState(null);

  const courses = Array.from(new Set(RECIPES.map(r => r.course).filter(Boolean))).sort();
  const tags = Array.from(new Set(RECIPES.flatMap(r => r.tags ? r.tags.split(',').map(t=>t.trim()) : []).filter(Boolean))).sort();

  const toggleIngredient = (ing) => {
    setSelectedIngs(prev => prev.includes(ing) ? prev.filter(i => i!==ing) : [...prev, ing]);
  };

  const filtered = RECIPES.filter(r => {
    const matchesQ = !q || (r.title && r.title.toLowerCase().match(new RegExp(q, 'i'))) || (r.ingredients && r.ingredients.join(" ").toLowerCase().match(new RegExp(q, 'i')));
    const matchesCourse = !course || r.course === course;
    const matchesTag = !tag || (r.tags && r.tags.toLowerCase().split(',').map(x=>x.trim()).includes(tag.toLowerCase()));
    const matchesIngredients = selectedIngs.length === 0 || (r.ingredients && selectedIngs.every(selIng => {
      if (selIng.includes(' ')) {
        // Deux mots : recherche exacte de la phrase complète (insensible à la casse)
        return r.ingredients.some(ri => new RegExp(selIng.replace(/[-/\^$*+?.()|[\]{}]/g, '\$&'), 'i').test(ri.toLowerCase()));
      } else {
        // Un seul mot : correspondance par mot entier
        const escaped = selIng.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
return r.ingredients.some(ri => new RegExp(`\\b${escaped}\\b`, 'i').test(ri.toLowerCase()));

      }
    }));
    return matchesQ && matchesCourse && matchesTag && matchesIngredients;
  });
  // counter handled in render

  return e('div', {className:'container'},[
    e('h1', {style:{display:'flex', alignItems:'baseline', gap:'8px'}}, [
  '🥗 Yum Book',
  e('span', {style:{fontSize:'0.8em', fontWeight:'normal', color:'#777', fontStyle:'italic', marginLeft:'8px'}}, 
    filtered.length + ' recipe' + (filtered.length > 1 ? 's' : '') + ' found'
  )
]),
    e('div', {className:'controls'},[e('button', {
    id: 'toggle-ingredients-btn',
    style: { marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' },
    onClick: () => {
        const filter = document.getElementById('ingredients-filter');
        if (filter) {
            if (filter) {
            // Toggle inline display to override the #ingredients-filter default
            if (filter.style.display && filter.style.display !== 'none') {
                filter.style.display = 'none';
            } else {
                filter.style.display = 'block';
            }
        }
        }
    }
}, '☰'),
      
      e('input', {placeholder: 'Search...', value:q, onChange:e=>setQ(e.target.value)}),
      e('select', {value:course, onChange:e=>setCourse(e.target.value)}, [e('option', {value:''}, '🍴'), ...courses.map(c=>e('option', {key:c, value:c}, c))]),
      e('select', {value:tag, onChange:e=>setTag(e.target.value)}, [e('option', {value:''}, '🏷️'), ...tags.map(t=>e('option', {key:t, value:t}, t))]),
      e('button', {onClick:()=>{setQ('');setCourse('');setTag('');setSelectedIngs([]);}}, '↺')
    ]),
    e('div', {id:'ingredients-filter', style:{marginBottom:'10px', className:'hidden'}},
      Object.entries(TOP_INGREDIENTS).map(([cat, items]) =>
        e('div', {key:cat, style:{marginBottom:'6px'}}, [
          e('strong', null, cat),
          e('div', {style:{display:'flex',flexWrap:'wrap',gap:'8px'}}, items.map(ing =>
            e('label', {key:ing, style:{display:'flex',alignItems:'center',gap:'4px'}}, [
              e('input', {
                type:'checkbox',
                checked:selectedIngs.includes(ing),
                onChange:()=>toggleIngredient(ing)
              }),
              ing
            ])
          ))
        ])
      )
    ),
    e('div', {className:'grid'}, filtered.map((r,i)=>
      e('div', {key:r.title || i, className:'card', onClick:()=>setOpen(r), style:{cursor:'pointer'}}, [
        r.photo_url ? e('img', {src:r.photo_url, alt:r.title, loading:"lazy", style:{cursor:'pointer'}, }) : null,
        e('h3', {style:{cursor:'pointer'}, }, r.title),
        e('div', {style:{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}, [ e('span', null, r.course || ''), r.prep_time ? e('span', {style:{fontSize:'0.85em', color:'#999', fontStyle:'italic'}}, `(${r.prep_time})`) : null ])
      ])
    )),
    open ? e('div', {className:'modal-backdrop', onClick:()=>setOpen(null)},[
      e('div', {className:'modal', onClick:ev=>ev.stopPropagation(), style:{position:'relative'}},[
        e('button', {
            onClick: () => setOpen(null),
            style: {
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
            }
        }, '✖'),
        e('h2', null, open.title),
        open.photo_url ? e('img', {src:open.photo_url, style:{width:"100%",maxHeight:"200px",objectFit:"cover"}, loading:"lazy"}) : null,
        e('div', {dangerouslySetInnerHTML:{__html: linkify(open.description)}}),
        // Section détails de la recette
        e('div', {className: 'recipe-details', style: {margin: "10px 0", fontSize: "0.9em"}}, [
            e('div', null, `Serves: ${open.serves || ''}`),
            e('div', null, `Prep time: ${open.prep_time || ''}`),
            e('div', null, `Cook time: ${open.cook_time || ''}`),
            e('div', null, `Course: ${open.course || ''}`),
            e('div', null, `Tags: ${Array.isArray(open.tags) ? open.tags.join(', ') : (open.tags || '')}`)
        ]),
        e('h4', null, 'Ingredients'),
        e('ul', null, open.ingredients ? open.ingredients.map((ing,idx)=>e('li', {key:ing || idx}, ing)) : null),
        e('h4', null, 'Directions'),
        e('div', { className: 'recipe-directions' }, open.directions || '')
      ])
    ]) : null
  ]);
}

function initApp() {
  ReactDOM.createRoot(document.getElementById('root')).render(e(App));
}

// Appliquer la police de <pre> à la description
document.addEventListener('DOMContentLoaded', function() {
    var el = document.querySelector('.recipe-directions');
    if (el) { el.style.fontFamily = 'monospace'; }
});


// === Auto-numbering recipe directions ===
function numeroterEtapes(container) {
    let steps = container.innerHTML
        .split(/\n\s*\n/) // split by double newline
        .map(s => s.trim())
        .filter(s => s.length > 0);

    let nutritionInfo = null;

    steps = steps.map((step, index) => {
        if (step.includes("Calories:")) {
            let parts = step.split("Calories:");
            let before = parts[0].trim();
            let after = parts[1] ? parts[1].trim() : "";
            nutritionInfo = "Calories: " + after;
            return `<p>${index + 1}) ${before}</p>`;
        } else {
            return `<p>${index + 1}) ${step}</p>`;
        }
    });

    container.innerHTML = steps.join("\n\n");

    if (nutritionInfo) {
        let nutritionSection = document.createElement("div");
        nutritionSection.innerHTML = `<h3>Nutrition Info</h3><p>${nutritionInfo.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*: [^A-Z]+)/g).join("<br>")}</p>`;
        container.appendChild(nutritionSection);
    }
}

const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // element
                if (node.matches && node.matches(".recipe-directions")) {
                    numeroterEtapes(node);
                }
                const directions = node.querySelector?.(".recipe-directions");
                if (directions) {
                    numeroterEtapes(directions);
                }
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

document.addEventListener("DOMContentLoaded", () => {
    const existing = document.querySelector(".recipe-directions");
    if (existing) {
        numeroterEtapes(existing);
    }
});
// === End auto-numbering ===

// Chargement des recettes après que tout soit défini

// Start after everything is defined
loadRecipes();
