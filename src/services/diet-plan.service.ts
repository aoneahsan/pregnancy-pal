import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { DietPlan, Meal, NutritionTargets, DietaryRestriction, PregnancyProfile } from '@/types'

const COLLECTION_NAME = 'dietPlans'

export class DietPlanService {
  static async create(plan: Omit<DietPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<DietPlan> {
    const docRef = doc(collection(db, COLLECTION_NAME))
    const now = new Date()
    
    const newPlan: DietPlan = {
      ...plan,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    }

    await setDoc(docRef, {
      ...newPlan,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    })

    return newPlan
  }

  static async getActiveByUserId(userId: string): Promise<DietPlan | null> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()

    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as DietPlan
  }

  static async getAllByUserId(userId: string): Promise<DietPlan[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as DietPlan
    })
  }

  static async update(id: string, updates: Partial<DietPlan>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id)
    
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    }

    delete updateData.id
    delete updateData.createdAt

    await updateDoc(docRef, updateData)
  }

  static async setActive(userId: string, planId: string): Promise<void> {
    // Deactivate all other plans
    const allPlans = await this.getAllByUserId(userId)
    for (const plan of allPlans) {
      if (plan.id !== planId && plan.isActive) {
        await this.update(plan.id, { isActive: false })
      }
    }

    // Activate the selected plan
    await this.update(planId, { isActive: true })
  }

  static generateDefaultPlan(profile: PregnancyProfile, restrictions?: DietaryRestriction[]): Omit<DietPlan, 'id' | 'createdAt' | 'updatedAt'> {
    const trimester = profile.currentTrimester
    
    // Base calorie needs by trimester
    const baseCalories = trimester === 1 ? 2000 : trimester === 2 ? 2200 : 2400

    const nutritionTargets: NutritionTargets = {
      calories: { min: baseCalories - 100, max: baseCalories + 100 },
      protein: { min: 70, max: 100 }, // grams
      carbohydrates: { min: 175, max: 250 }, // grams
      fat: { min: 60, max: 85 }, // grams
      fiber: { min: 25, max: 35 }, // grams
      calcium: { min: 1000, max: 1300 }, // mg
      iron: { min: 27, max: 35 }, // mg
      folate: { min: 600, max: 800 }, // mcg
      vitaminD: { min: 600, max: 800 }, // IU
    }

    const meals = this.generateSampleMeals(trimester)

    return {
      userId: profile.userId,
      pregnancyProfileId: profile.id,
      name: `Trimester ${trimester} Nutrition Plan`,
      description: `Personalized nutrition plan for your ${this.getOrdinal(trimester)} trimester`,
      trimester,
      totalCalories: baseCalories,
      meals,
      nutritionTargets,
      restrictions: restrictions || [],
      isActive: true,
    }
  }

  private static generateSampleMeals(trimester: 1 | 2 | 3): Meal[] {
    const meals: Meal[] = []

    // Breakfast
    meals.push({
      id: 'breakfast-1',
      name: 'Nutritious Morning Bowl',
      type: 'breakfast',
      time: '07:00',
      foods: [],
      totalCalories: trimester === 1 ? 400 : trimester === 2 ? 450 : 500,
      nutrition: {
        calories: trimester === 1 ? 400 : trimester === 2 ? 450 : 500,
        protein: 20,
        carbohydrates: 55,
        fat: 15,
        fiber: 8,
        sugar: 12,
        sodium: 300,
        calcium: 300,
        iron: 6,
        folate: 150,
        vitaminD: 100,
        omega3: 500,
      },
      preparationTime: 15,
      difficulty: 'easy',
      instructions: [
        'Combine oatmeal with milk and cook for 5 minutes',
        'Add fresh berries and sliced banana',
        'Top with chopped nuts and a drizzle of honey',
        'Serve with a glass of fortified orange juice'
      ],
      tips: [
        'Use fortified milk for extra calcium and vitamin D',
        'Choose steel-cut oats for better fiber content',
        'Add ground flaxseed for omega-3 fatty acids'
      ]
    })

    // Morning Snack
    meals.push({
      id: 'snack-1',
      name: 'Energy Boost Snack',
      type: 'snack',
      time: '10:00',
      foods: [],
      totalCalories: 200,
      nutrition: {
        calories: 200,
        protein: 8,
        carbohydrates: 25,
        fat: 8,
        fiber: 3,
        sugar: 15,
        sodium: 150,
        calcium: 100,
        iron: 2,
        folate: 40,
        vitaminD: 0,
        omega3: 100,
      },
      preparationTime: 5,
      difficulty: 'easy',
      instructions: [
        'Slice an apple',
        'Spread almond butter on apple slices',
        'Enjoy with a handful of whole grain crackers'
      ],
      tips: [
        'Choose organic apples when possible',
        'Natural almond butter without added sugar is best'
      ]
    })

    // Lunch
    meals.push({
      id: 'lunch-1',
      name: 'Power Lunch Bowl',
      type: 'lunch',
      time: '12:30',
      foods: [],
      totalCalories: trimester === 1 ? 500 : trimester === 2 ? 550 : 600,
      nutrition: {
        calories: trimester === 1 ? 500 : trimester === 2 ? 550 : 600,
        protein: 30,
        carbohydrates: 60,
        fat: 18,
        fiber: 10,
        sugar: 8,
        sodium: 500,
        calcium: 200,
        iron: 8,
        folate: 200,
        vitaminD: 50,
        omega3: 800,
      },
      preparationTime: 25,
      difficulty: 'medium',
      instructions: [
        'Grill salmon fillet with lemon and herbs',
        'Prepare quinoa according to package directions',
        'Steam broccoli and carrots until tender',
        'Combine ingredients in a bowl',
        'Drizzle with olive oil and lemon dressing'
      ],
      tips: [
        'Wild-caught salmon is preferred for omega-3s',
        'Add spinach for extra iron and folate',
        'Quinoa is a complete protein source'
      ]
    })

    // Afternoon Snack
    meals.push({
      id: 'snack-2',
      name: 'Afternoon Pick-Me-Up',
      type: 'snack',
      time: '15:30',
      foods: [],
      totalCalories: 150,
      nutrition: {
        calories: 150,
        protein: 10,
        carbohydrates: 15,
        fat: 6,
        fiber: 2,
        sugar: 10,
        sodium: 100,
        calcium: 200,
        iron: 1,
        folate: 30,
        vitaminD: 50,
        omega3: 0,
      },
      preparationTime: 3,
      difficulty: 'easy',
      instructions: [
        'Mix Greek yogurt with honey',
        'Add fresh berries',
        'Sprinkle with granola'
      ],
      tips: [
        'Choose plain Greek yogurt to control sugar',
        'Fresh berries provide antioxidants'
      ]
    })

    // Dinner
    meals.push({
      id: 'dinner-1',
      name: 'Balanced Evening Meal',
      type: 'dinner',
      time: '18:30',
      foods: [],
      totalCalories: trimester === 1 ? 550 : trimester === 2 ? 600 : 650,
      nutrition: {
        calories: trimester === 1 ? 550 : trimester === 2 ? 600 : 650,
        protein: 35,
        carbohydrates: 65,
        fat: 20,
        fiber: 12,
        sugar: 10,
        sodium: 600,
        calcium: 150,
        iron: 10,
        folate: 180,
        vitaminD: 0,
        omega3: 300,
      },
      preparationTime: 35,
      difficulty: 'medium',
      instructions: [
        'Season and bake chicken breast',
        'Roast sweet potatoes with olive oil',
        'Prepare a mixed green salad',
        'Steam green beans',
        'Serve with whole grain roll'
      ],
      tips: [
        'Dark leafy greens provide folate',
        'Sweet potatoes are rich in vitamin A',
        'Lean protein supports baby development'
      ]
    })

    // Evening Snack (if needed)
    if (trimester > 1) {
      meals.push({
        id: 'snack-3',
        name: 'Evening Comfort Snack',
        type: 'snack',
        time: '20:30',
        foods: [],
        totalCalories: 200,
        nutrition: {
          calories: 200,
          protein: 8,
          carbohydrates: 30,
          fat: 6,
          fiber: 3,
          sugar: 15,
          sodium: 200,
          calcium: 250,
          iron: 2,
          folate: 50,
          vitaminD: 100,
          omega3: 0,
        },
        preparationTime: 5,
        difficulty: 'easy',
        instructions: [
          'Warm a cup of fortified milk',
          'Serve with whole grain crackers',
          'Add a small piece of cheese if desired'
        ],
        tips: [
          'Warm milk can help with sleep',
          'Avoid eating too close to bedtime'
        ]
      })
    }

    return meals
  }

  private static getOrdinal(n: number): string {
    const ordinals = ['first', 'second', 'third']
    return ordinals[n - 1] || `${n}th`
  }
}