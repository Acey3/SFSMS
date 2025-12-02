import { Route, Switch } from "wouter";
import navbar from "./components/navbar";
import "./style.css";


// ✅ Import all your pages
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Recipes from "./pages/recipes";
import Production from "./pages/production";
import Users from "./pages/users";
import Ingredients from "./pages/ingredients";
import Addproduction from "./pages/addproduction";

const App = () => {
  navbar();
  return (
    <div className="min-h-screen bg-green-50">
    
      <main className="max-w-5xl mx-auto p-6">
        <Switch>
          {/* Public Route */}
          <Route path="/" component={Login} />
          <Route path="/dashboard" component={Dashboard} />

          {/* Protected (Dashboard) Routes */}
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/recipes" component={Recipes} />
          <Route path="/production" component={Production} />
          <Route path="/addproduction" component={Addproduction}/>
          <Route path="/users" component={Users} />
          <Route path="/ingredients" component={Ingredients} />

        </Switch>
      </main>
    </div>
  );
};

export default App;
