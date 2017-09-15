/** Population class
 * –––––––––––––––––––––––––––––
 * Controls the populations and 
 * keeps track of marked 
 * individuals for mating when
 * producing new generations.
 */
var Population = function(basePopulation, mutationRate){
    this.size = basePopulation;
    this.individuals = [];
    this.mutationRate = mutationRate;

    // Create chromosomes for base population
    for(var i = 0; i< basePopulation; i++){
        c = new Chromosome();
        this.individuals.push(c);
    }
};
Population.prototype.individuals=[];
Population.prototype.fitIndividuals=[];
Population.prototype.generationNumber=0;
Population.prototype.mutationRate=0;
Population.prototype.size=0;

/**
 * Marks a chromosome as a pretty chromosome, that is
 * as a fit chromosome used for the production of the
 * new generation.
 */
Population.prototype.markFitness = function(chromosome){
    this.fitIndividuals.push(chromosome);

    // Update genetic details of marked individuals.
    this.visualise();
};

/**
 * Creates a new generating by crossing random genes
 * from the fit chromosomes.
 */
Population.prototype.generation = function() {
    // Get settings.
    this.generationNumber++;
    this.mutationRate=$('#mutationRate').val();
    
    var newGeneration = [];

    // Crossover chromosome DNA  of randomly selected 
    // marked individuals.
    while(newGeneration.length<this.size){
        var randomMaleIdx = Math.floor(Math.random()*this.fitIndividuals.length);
        var randomFemaleIdx = Math.floor(Math.random()*this.fitIndividuals.length);
        var male = this.fitIndividuals[randomMaleIdx];
        var female = this.fitIndividuals[randomFemaleIdx];

        // Mate the male and the female.
        var newIndividuals = male.mate(female);
        
        newGeneration.push(newIndividuals[0]);
        newGeneration.push(newIndividuals[1]);
    }
    
    // Mutate the new generation chromosomes.
    for(var i = 0; i < newGeneration.length; i++)
        newGeneration[i].mutate(this.mutationRate);
    
    this.individuals=newGeneration;
    this.fitIndividuals=[];
    this.visualise();
};

/**
 * Visualise all the fit individuals of 
 * a population.
 */
Population.prototype.visualise = function(){

    // Update visual information
    $('#mutationRate').attr('value',this.mutationRate);  
    $('#populationNumber').html(this.generationNumber);
    
    var description="";
    for(var i = 0; i < this.fitIndividuals.length; i++){
        description+='<p><center><b>Gene '+i+':</b></center>\n'+this.fitIndividuals[i].genes+'</p>';
    }

    $('.btn-danger').attr('data-content', description);
    $('.btn-danger').show();

    $('#fitnessMarked').html(this.fitIndividuals.length);
};



/* Chromosome class
 * –––––––––––––––––––––––––––––
 * Manages the chromosomes and
 * their phenotype information.
 */
var Chromosome = function(code){
    // Phenotype setup
    var c = this;

    // Make the setup object
    // that handles frameRate
    // size and background colour.
    c.proteins.setup={};
    c.proteins.setup.pos=0;
    c.proteins.setup.process='setup';
    c.proteins.setup.size=0;
    c.proteins.setup.fn = function(processing) {
        return function(){
            processing.size(200,200);
            processing.frameRate(this.getPhenotype(2,2) / 4);
            processing.background(this.getPhenotypeRGB(4,3), this.getPhenotypeRGB(7,3), this.getPhenotypeRGB(10,3));
            processing.artify();
        };
    };

    // Setup the drawing object
    // which allows for animated
    // canvases.
    c.proteins.drawing={};
    c.proteins.drawing.pos=1;
    c.proteins.drawing.process='draw';
    c.proteins.drawing.size=2;
    c.proteins.drawing.fn = function(processing){
        return function(){
            var drawing = (this.getPhenotype(0,1)<5 && this.getPhenotype(1,1)<5 && this.getPhenotype(2,2)!="00") ? true : false;
            if(!drawing)
                return;

            processing.artify();
        };
    };

    // Setup the link from the chromosome
    // data to the frame rate data.
    c.proteins.frameRate={};
    c.proteins.frameRate.pos=2;
    c.proteins.frameRate.size=2;

    // Setup the link from the chromosome
    // data to the background data.
    c.proteins.background={};
    c.proteins.background.pos=3;
    c.proteins.background.size=9;

    // Create the ellipse object
    // that allows for drawing
    // ellipses on the canvas.
    c.proteins.ellipse={};
    c.proteins.ellipse.pos=4;
    c.proteins.ellipse.artify=true;
    c.proteins.ellipse.multiplier=true; //Adds one extra gene to chromosome
    c.proteins.ellipse.size=11;
    c.proteins.ellipse.fn = function(processing,gene,siblings,offset){
        processing.fill(c.getPhenotypeRGB(offset+2,3,gene),
                        c.getPhenotypeRGB(offset+5,3,gene),
                        c.getPhenotypeRGB(offset+8,3,gene));
        var radius = c.getPhenotype(offset,2,gene);
        processing.ellipse(processing.width*Math.random(),processing.height*Math.random(),radius,radius);
    };

    // Create linegrid object
    // that allows for interpreting
    // the chromosome data to form
    // a linegrid.
    c.proteins.linegrid={};
    c.proteins.linegrid.pos=5;
    c.proteins.linegrid.artify=true;
    c.proteins.linegrid.multiplier=true; //Adds one extra gene to chromosome
    c.proteins.linegrid.size=5;
    c.proteins.linegrid.fn = function(processing,gene,siblings,offset){
        var times;
        var spacing;
        var cX = processing.width/2;
        var cY = processing.height/2; 

        if(siblings > 7){
            spacing = processing.width/(c.getPhenotype(offset,3,gene)/150);
            
            times = Math.ceil(processing.width/spacing);
            for(var i=0;i<times;i++){
                processing.line(0,i*spacing,processing.width,i*spacing);
                processing.line(i*spacing,0,i*spacing,processing.height);
            }
        } else if (siblings < 4){
            times = 360/c.getPhenotype(offset+3,2,gene);
            spacing = 360/times;
            for(var j=0;j<times;j++){
                processing.line(cX,cY,cX+Math.cos(j*spacing)*200,cY+Math.sin(j*spacing)*200);
            }
        }
    };
    
    // Assign DNA code to the chromosome genes
    // if one is provided, otherwise make one.
    if (code) {
        c.genes=code;
    } else {
        c.genes = c.make(); 
    }

    c.mutationSegmentLength = 5;
};
Chromosome.prototype.proteins={};
Chromosome.prototype.mutationSegmentLength = 0;

/**
 * Makes a random chromosome.
 */
Chromosome.prototype.make = function(){
    var temporaryGene = '';
    var proteinsSorted = sortDictionary(this.proteins);

    for(var i=0;i<proteinsSorted.length;i++){
        var protein = proteinsSorted[i];

        var multiplier = 1;
        if(protein.multiplier && protein.size>0){
            multiplier=this.makeGene(1);
            temporaryGene+=multiplier;
        }
        var g = this.makeGene(multiplier*protein.size);
        temporaryGene+=g;
    }
    return temporaryGene;
};

/** 
 * Makes a gene on a chromosome.
 */
Chromosome.prototype.makeGene = function(times,max){
    var temporaryGene = '';
    for(var i=0;i<times;i++){
        if(max){
            temporaryGene+=Math.floor(Math.random()*(max+1)).toString();
        }else{
            temporaryGene+=Math.floor(Math.random()*10).toString();
        }
    }
    return temporaryGene;
};

/** 
 * Creates two new children by crossing over. 
 */
Chromosome.prototype.mate = function(chromosome){
    var ownPivot = this.findPivot(Math.round(this.genes.length / 2) - 1);
    var matePivot = chromosome.findPivot(Math.round(chromosome.genes.length / 2) - 1);
    
    var childOne = this.genes.substr(0,ownPivot)+chromosome.genes.substr(matePivot);
    var childTwo = chromosome.genes.substr(0,matePivot)+this.genes.substr(ownPivot);
    
    return [new Chromosome(childOne),new Chromosome(childTwo)];   
};

/**
 * Finds a pivot.
 */
Chromosome.prototype.findPivot = function(pivot){
    var proteinsSorted = sortDictionary(this.proteins);
    var iterator=0;

    for(var i=0;i<proteinsSorted.length;i++){
        var protein = proteinsSorted[i];
        var multiplier = 1;

        if(protein.multiplier){
            multiplier=this.getPhenotype(iterator,1);
            iterator+=1;
            for(var j=0;j<multiplier;j++){
                if(pivot<=iterator)
                    return iterator;

                iterator+=protein.size;
            }
        }else{
            iterator+=protein.size;
        }

        if(pivot<=iterator)
            return iterator;
    } 
};

/**
 * Get phenotype from chromosome.
 */
Chromosome.prototype.getPhenotype = function(start,stop,gene){
    if(gene)
        return gene.substr(start,stop);
    
    return this.genes.replace(/\s/g, '').substr(start,stop);
};

/**
 * Get phenotype RGB.
 */
Chromosome.prototype.getPhenotypeRGB = function(start,stop,gene){
    if(gene)
        return (gene.substr(start,stop)/999)*255;
    
    return (this.genes.replace(/\s/g, '').substr(start,stop)/999)*255;
};

/**
 * Phenotype function which 
 * transform a gene to an art work.
 */
Chromosome.prototype.phenotype = function(processing) { 
    var addition=0;
    var c = this;
    for(var key in c.proteins){
        if(c.proteins[key].process){
            processing[c.proteins[key].process]=c.proteins[key].fn(processing).bind(c);
        }
    }
    
    processing.artify = function(){
        console.log('\n\n\n');
        console.log(c.genes+'('+c.genes.length+')');
        console.log('Begin:\n+-+-+-+-+-+-+-+');
        var iterator = 0;

        // Loop through all proteins
        var proteinsSorted = sortDictionary(c.proteins);
        for(var i=0;i<proteinsSorted.length;i++){
            var protein = proteinsSorted[i];

            if(!protein.artify){
                iterator+=protein.size;
                console.log(protein.name+' (ignore, i: '+iterator+')');
                continue;
            }

            var start = iterator;
            var end = iterator+c.getPhenotype(start,protein.size).length;
            
            if(protein.multiplier){
                end = iterator+c.getPhenotype(start,1)*protein.size+1;
            
                var siblings = c.getPhenotype(start,1);
                var gene = c.getPhenotype(start+1,end);
                for(var j=0;j<siblings;j++){
                    var offset=j*protein.size;
                    protein.fn(processing,gene,siblings,offset);
                }

                console.log(protein.name+' (s:'+start+'/e:'+end+' m: t)');
            }
            iterator=end;  
        } 
    };
};

/**
 * Mutates a gene.
 */
Chromosome.prototype.mutate = function (mutationRate){
    if(Math.random() > mutationRate)
        return false;
    
    var genes = this.genes;
    var segmentStart = this.findPivot(Math.floor(Math.random()*(genes.length+1)));
    var segmentEnd = this.findPivot(segmentStart+1);
    var mutatedSegment = this.makeGene(segmentEnd - segmentStart);
    
    var mutation = genes.substr(0,segmentStart)+mutatedSegment+genes.substring(segmentEnd);
    
    this.genes=mutation;
};

/** 
 * Helper functions.
 */
function escapeRegExp(stringToGoIntoTheRegex) {
    return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function sortDictionary(dict){
    var sortedDict = [];
    for(var key in dict){
        sortedDict[dict[key].pos]=dict[key];
        sortedDict[dict[key].pos].name=key;
    }

    return sortedDict;
}



/* Gallery class
 * –––––––––––––––––––––––––––––
 * Creates a gallery of canvases
 * for us to look at.
 */
var Gallery = function(rows,columns,population){
    this.rows=rows;
    this.columns=columns;
    this.population=population;
};
Gallery.prototype.rows='';
Gallery.prototype.columns='';
Gallery.prototype.population='';

/**
 * Opens the gallery by creating a canvas
 * for each individual in the population.
 */
Gallery.prototype.open = function(){
    var gallery = $('#gallery');
    
    // Empty gallery
    gallery.empty();

    // Iterate over rows and columns
    for(var i=0;i<this.rows;i++){
        gallery.append('<div class="row">');
        
        for(var j=0;j<this.columns;j++){
            // Get chromosome
            var c = this.population.individuals[i*this.columns+j];
            
            // Add canvas
            gallery.append('<div class="col-md-2" style="height:230px;width:230px;"><div id="chromosome-'+i.toString()+j.toString()+'" style="position:absolute;right:13px;bottom:28px;background-color:#000000;width:20px;height:20px;color:#666;padding:2px;font-size:15px;" data-placement="top" data-toggle="popover" title="DNA" data-content="'+c.genes+'"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span></div><canvas id="canvas'+i+j+'" width="200px" height="200px" style="border:1px solid #000"></canvas></div>');
            gallery.append('');
            gallery.append('');
            
            // Select canvas
            var canvas = $('#canvas'+i+j);
            
            // Attach processing
            var p = new Processing(canvas.get(0),c.phenotype.bind(c));
            canvas.click((function(processing,chromosome,population){
                return function(){
                    // chromosome.mutate();
                    // processing.artify();
                    population.markFitness(chromosome);
                    // console.log(population.fitIndividuals);
                };
            })(p,c,this.population));
        }
        
        gallery.append('</div>');
        
        $(function () {
            $('[data-toggle="popover"]').popover({html: true});
        });
    
    }
};

/* --------------------------------------------------------- */
/* ---------------------------RUN--------------------------- */
/* --------------------------------------------------------- */
$(document).ready(function() {
    
    // Create population
    var population = new Population(18,0.2);
    population.visualise();
    
    // Create canvasses
    var gallery = new Gallery(3,6,population);
    gallery.open();
    
    $('#generation').click(function(){
        population.generation();
        gallery.population=population;
        gallery.open();
    });
});