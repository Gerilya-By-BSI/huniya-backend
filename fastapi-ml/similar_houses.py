import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class SimilarHousesRecommender:
    def __init__(self):
        self.engine = None
        self.df = pd.DataFrame()
        self.scaler = None
        self.numeric_features = ['price', 'room_count', 'bathroom_count', 'parking_count', 'land_area', 'building_area']
        self.initialize()
        
    def initialize(self):
        """Initialize database connection and load data"""
        try:
            # Create database connection
            DATABASE_URL = os.getenv("DATABASE_URL")
            if not DATABASE_URL:
                logger.warning("DATABASE_URL not found in environment variables")
                return
                
            self.engine = create_engine(DATABASE_URL)
            
            # Load initial data
            self.refresh_data()
            
            # Initialize scaler
            if not self.df.empty:
                self.scaler = StandardScaler()
                self.scaler.fit(self.df[self.numeric_features])
                logger.info(f"Successfully initialized SimilarHousesRecommender with {len(self.df)} houses")
            else:
                logger.warning("No data loaded from database")
        except Exception as e:
            logger.error(f"Error initializing SimilarHousesRecommender: {e}")
    
    def refresh_data(self):
        """Refresh house data from database"""
        if not self.engine:
            logger.warning("Database engine not initialized")
            return
            
        try:
            query = """
            SELECT 
                id,
                index,
                title, 
                price, 
                location,
                room_count, 
                bathroom_count, 
                parking_count, 
                land_area, 
                building_area,
                image_url,
                is_sold
            FROM 
                houses
            WHERE
                is_sold = FALSE
            """
            
            self.df = pd.read_sql(query, self.engine)
            logger.info(f"Loaded {len(self.df)} houses from database")
            
            # Debug: Log unique locations
            locations = self.df['location'].unique()
            logger.info(f"Available locations: {', '.join(locations)}")
            
        except Exception as e:
            logger.error(f"Error loading data from database: {e}")
            
    def get_similar_houses(self, house_index, top_n=5):
        """Get similar houses based on a house index"""
        # Refresh data to get latest
        self.refresh_data()
        
        if self.df.empty:
            logger.warning("No house data available")
            return []
            
        try:
            # Find the house with the given index
            clicked_property = self.df[self.df['index'] == house_index]
            
            if clicked_property.empty:
                logger.warning(f"No house found with index {house_index}")
                return []
            
            clicked_property = clicked_property.iloc[0]
            
            # Debug: Log the clicked property details
            logger.info(f"Finding similar houses for index {house_index}, location: {clicked_property['location']}")
            
            # Apply strict location filter
            clicked_location = clicked_property['location']
            filtered_df = self.df[self.df['location'] == clicked_location]
            
            # Log how many houses we have in the same location
            logger.info(f"Found {len(filtered_df)} houses in location: {clicked_location}")
            
            # Remove the selected house
            filtered_df = filtered_df[filtered_df['index'] != house_index]
            
            if filtered_df.empty:
                logger.info(f"No other houses found in location: {clicked_location}")
                return []
            
            # Check if we have enough houses for comparison
            if len(filtered_df) < top_n:
                logger.info(f"Only {len(filtered_df)} houses available in {clicked_location}, fewer than requested {top_n}")
                
            # Scale features
            filtered_features = self.scaler.transform(filtered_df[self.numeric_features])
            clicked_property_features = self.scaler.transform([clicked_property[self.numeric_features]])
            
            # Calculate similarity
            similarities = cosine_similarity(clicked_property_features, filtered_features)
            filtered_df['similarity_score'] = similarities[0]
            
            # Get top similar houses
            top_similar = filtered_df.sort_values('similarity_score', ascending=False).head(top_n)
            
            # Log the results
            similar_indices = top_similar['index'].tolist()
            logger.info(f"Returning {len(similar_indices)} similar houses with indices: {similar_indices}")
            
            # Return indices
            return similar_indices
            
        except Exception as e:
            logger.error(f"Error finding similar houses: {e}", exc_info=True)
            return []

# Create a singleton instance
recommender = SimilarHousesRecommender()