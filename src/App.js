import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MultiSelect from "react-multi-select-component";

import { movies$ } from "./services/movies";

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

class App extends Component{

  constructor(props) {
    super(props);
    this.state = { movies: [], 
                   categories: [], 
                   filteredMovies: [], 
                   selectOption: [], 
                   filterSelection: [], 
                   filterPaginatedSelection: [],
                   alreadyLiked: [],
                   paginationSize: 12,
                   paginationStart: 0,
                   paginationEnd: 11,
                   paginationCurrentStep: 0
                  };
  }
  componentDidMount(){
    this.retrieveMovies();
  }

  retrieveMovies = () => {
    movies$.then(response => {
      let categoriesAndSelectOptions = this.updateMoviesCategories(response);
      let categories = categoriesAndSelectOptions[0];
      let selectOptions = categoriesAndSelectOptions[1];
      this.setState({
        movies: response,
        categories: categories,
        filteredMovies: response,
        filterPaginatedSelection: response.slice(this.state.paginationCurrentStep,this.state.paginationCurrentStep+this.state.paginationSize),
        selectOption: selectOptions
      });
    }).catch(error => {
      console.log("Une erreur est survenue");
    })
  };

  updateMoviesCategories = (moviesList) => {
    let categories = [];
    let selectOptions = [];
    let currentCategory = "";
    moviesList.forEach((item, index) => {
      currentCategory = item.category;
      if(this.categoryNotExist(currentCategory, categories)){
        categories.push(currentCategory);
        selectOptions.push({
          value: item.category,
          label: item.category
        });
      }
    });
    return [categories, selectOptions];
  };

  categoryNotExist = (category, categoriesList) => {
    let result = true;
    for(let i=0; i<categoriesList.length; i++){
      if(category===categoriesList[i]){
        result = false;
        break;
      }
    }
    return result;
  };

  setFilterCategories = (selection) => {
    let movies = this.state.movies;
    let filteredMovies = [];

    movies.forEach((item, index) => {
      if(this.movyInSelection(item, selection)){
        filteredMovies.push(item);
      }
    })
    this.setState({
      filterSelection: selection,
      filteredMovies: filteredMovies,
      filterPaginatedSelection:filteredMovies.slice(this.state.paginationCurrentStep, this.state.paginationCurrentStep+this.state.paginationSize)
    });
  };

  movyInSelection = (movy, selection) => {
    let result = false;

    for(let i=0; i<selection.length; i++){
      if(movy.category === selection[i].value){
        result = true;
        break;
      }
    }

    return result;
  };

  deleteMovy = (item, index) => {
    let movies = [...this.state.movies];
    movies.splice(index, 1);
    let filterPaginatedSelection = movies.slice(this.state.paginationCurrentStep, this.state.paginationCurrentStep+this.state.paginationSize);
    let categoriesAndSelectOptions = this.updateMoviesCategories(movies);
    let categories = categoriesAndSelectOptions[0];
    let selectOptions = categoriesAndSelectOptions[1];
    this.setState({
        movies: movies,
        categories: categories,
        filteredMovies: movies,
        filterPaginatedSelection: filterPaginatedSelection,
        selectOption: selectOptions
      });
  };

  likeMovy = (movy, index) => {
    let movies = [...this.state.movies];

    if(!this.movyAlreadyLiked(movy)){
      movies[index].likes = movies[index].likes + 1;
      let alreadyLiked = [...this.state.alreadyLiked, movy];
      let filterPaginatedSelection = movies.slice(this.state.paginationCurrentStep, this.state.paginationCurrentStep+this.state.paginationSize);
      this.setState({
        movies: movies,
        filteredMovies: movies,
        filterPaginatedSelection: filterPaginatedSelection,
        alreadyLiked: alreadyLiked
      });
    }
  };

  dislikeMovy = (movy, index) => {
    let movies = [...this.state.movies];

    if(!this.movyAlreadyLiked(movy)){
      movies[index].dislikes = movies[index].dislikes + 1;
      let alreadyLiked = [...this.state.alreadyLiked, movy];
      let filterPaginatedSelection = movies.slice(this.state.paginationCurrentStep, this.state.paginationCurrentStep+this.state.paginationSize);
      this.setState({
        movies: movies,
        filteredMovies: movies,
        filterPaginatedSelection: filterPaginatedSelection,
        alreadyLiked: alreadyLiked
      });
    }
  };

  movyAlreadyLiked = (movy) => {
    let result = false;
    let alreadyLikedMovies = [...this.state.alreadyLiked];

    if(alreadyLikedMovies.length!==0){
      for(let i=0; i<alreadyLikedMovies.length; i++){
        if(movy.id===alreadyLikedMovies[i].id){
          result = true;
          break;
        }
      }
    }
    
    return result;
  }

  convertLikeValue = (likes) => {
    let result = "";

    if(likes<1000){
      result = ""+likes;
    }else if(likes<999999){
      result = parseInt(likes/1000)+" K";
    }else{
      result = parseInt(likes/1000000)+" M";
    }
    return result;
  };

  updatePaginationSize = (event) => {
    let filteredMovies = [...this.state.filteredMovies];

    
    this.setState({
      paginationSize: event.target.value,
      filterPaginatedSelection: filteredMovies.slice(this.state.paginationCurrentStep, this.state.paginationCurrentStep+event.target.value)
    });
  };

  goToPreviousPageSelection = () => {
    let movies = [...this.state.filteredMovies];
    let currentPageStep = this.state.paginationCurrentStep;
    let pageSize = this.state.paginationSize;
    if(currentPageStep>=pageSize){
      currentPageStep -= pageSize;
    }

    let filterPaginatedSelection = movies.slice(currentPageStep-pageSize, currentPageStep);
    console.log(filterPaginatedSelection);
    this.setState({
      paginationCurrentStep: currentPageStep,
      filterPaginatedSelection: filterPaginatedSelection
    });
  };

  goToNextPageSelection = () => {
    let movies = [...this.state.filteredMovies];
    let currentPageStep = this.state.paginationCurrentStep;
    let pageSize = this.state.paginationSize;
    if(currentPageStep+pageSize<movies.length){
      currentPageStep += pageSize;
    }

    let filterPaginatedSelection = movies.slice(currentPageStep, currentPageStep+pageSize);
    console.log(filterPaginatedSelection);
    this.setState({
      paginationCurrentStep: currentPageStep,
      filterPaginatedSelection: filterPaginatedSelection
    });
  };

  render(){    

    let moviesList = this.state.filterPaginatedSelection.map((item, index) => {
      return (
          <Col sm={3} key={index}>
            <div className="movy-item">
              <Row className="m-0">
                <span className="movy-title-icon">{item.title.charAt(0)}</span>
                <Col>
                  <span className="movy-title">{item.title}</span><br />
                  <span className="movy-category">{item.category}</span> <br />
                  <span><i className="fa fa-thumbs-o-up" aria-hidden="true" onClick={()=>this.likeMovy(item, index)}></i> {this.convertLikeValue(item.likes)} </span>
                  <span><i className="fa fa-thumbs-o-down" aria-hidden="true" onClick={()=>this.dislikeMovy(item, index)}></i> {this.convertLikeValue(item.dislikes)}</span>
                  <span><i className="fa fa-trash-o delete-button" aria-hidden="true" onClick={()=>this.deleteMovy(item,index)}></i></span>
                </Col>
              </Row>
            </div>
          </Col>
        );
    });


    return (
      <div className="App">
        <Row className="m-0">
          <div className="jumbotron header w-100">
            <h1>My movies</h1>
          </div>
        </Row>
        <Row className="m-0">
          <Row className="m-auto movy-filter-section">
            <MultiSelect options={this.state.selectOption}
                         value={this.state.filterSelection}
                         onChange={this.setFilterCategories}
                         labelledBy={"Category"}
                         className="w-50" />
            <Col>
              <span className="pager-size">Size <input type="number" min="4" max="12" step="4" value={this.state.paginationSize} onChange={this.updatePaginationSize}/></span>
              <button className="pager-prev" onClick={()=>this.goToPreviousPageSelection()}>Previous</button>
              <button className="pager-next" onClick={()=>this.goToNextPageSelection()}>Next</button>
            </Col>
          </Row>
          <Row className="m-auto movy-list-container">
            {moviesList}
          </Row>
        </Row>
      </div>
    );
  }
  
}

export default App;
